/* eslint-disable @typescript-eslint/no-unused-vars */
import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { AuthRegisterDTO } from './dto/auth-register.dto';

@Injectable()
export class AuthService {
  private audience: string = 'users';
  private issuer: string = 'login';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailer: MailerService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  createToken(user: Users) {
    return {
      accessToken: this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '7 days',
          subject: String(user.id),
          issuer: this.issuer,
          audience: this.audience,
          // notBefore: 3600,
        },
      ),
    };
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        audience: this.audience,
        issuer: this.issuer,
      });
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOneBy({
      email,
    });

    if (!user) throw new UnauthorizedException('Invalid access data');

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid access data');
    }

    return this.createToken(user);
  }

  async forget(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) throw new UnauthorizedException('E-mail not registered');

    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: '10 minutes',
        subject: String(user.id),
        issuer: 'forget',
        audience: 'users',
        // notBefore: 3600,
      },
    );

    await this.mailer.sendMail({
      subject: 'Recuperar senha',
      to: 'sidney.e.s.s.jr@gmail.com',
      template: 'forget',
      context: {
        name: user.name,
        link: `http://localhost:5173/esqueceu-senha?token=${token}`,
      },
    });

    return true;
  }

  async reset(password: string, token: string) {
    try {
      const { id } = this.jwtService.verify(token, {
        audience: 'users',
        issuer: 'forget',
      });

      if (isNaN(Number(id))) throw new BadRequestException('Token invalido');

      password = await bcrypt.hash(password, bcrypt.genSaltSync());

      const [_, user] = await Promise.all([
        this.userRepository.update(Number(id), { password }),
        this.userRepository.findOneBy(id),
      ]);

      return this.createToken(user);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);

    return this.createToken(user);
  }
}
