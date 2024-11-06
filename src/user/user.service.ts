import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: CreateUserDTO) {
    const salt = await bcrypt.genSalt();

    data.password = await bcrypt.hash(data.password, salt);
    const newUser = this.userRepository.create(data);
    return this.userRepository.save(newUser);
  }

  async readAll() {
    return this.userRepository.find();
  }

  async read(id: number) {
    await this.exists(id);
    return this.userRepository.findOneBy({
      id,
    });
  }

  async update(id: number, data: UpdatePutUserDTO) {
    await this.exists(id);

    data.password = await bcrypt.hash(data.password, bcrypt.genSaltSync());

    await this.userRepository.update(id, data);
  }

  async partialUpdate(id: number, data: UpdatePatchUserDTO) {
    await this.exists(id);

    if (data.password)
      data.password = await bcrypt.hash(data.password, bcrypt.genSaltSync());

    await this.userRepository.update(id, data);
  }

  async delete(id: number) {
    await this.exists(id);
    await this.userRepository.delete(id);
  }

  async exists(id: number) {
    const data = await this.userRepository.count({ where: { id } });
    if (!data) {
      throw new NotFoundException();
    }
  }
}
