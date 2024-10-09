import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDTO) {
    const salt = await bcrypt.genSalt();

    data.password = await bcrypt.hash(data.password, salt);
    return this.prisma.users.create({
      data,
    });
  }

  async readAll() {
    return this.prisma.users.findMany();
  }

  async read(id: number) {
    await this.exists(id);
    return this.prisma.users.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, data: UpdatePutUserDTO) {
    await this.exists(id);

    data.password = await bcrypt.hash(data.password, bcrypt.genSaltSync());

    await this.prisma.users.update({ data, where: { id } });
  }

  async partialUpdate(id: number, data: UpdatePatchUserDTO) {
    await this.exists(id);

    if (data.password)
      data.password = await bcrypt.hash(data.password, bcrypt.genSaltSync());

    await this.prisma.users.update({ data, where: { id } });
  }

  async delete(id: number) {
    await this.exists(id);
    await this.prisma.users.delete({ where: { id } });
  }

  async exists(id: number) {
    const data = await this.prisma.users.count({ where: { id } });
    if (!data) {
      throw new NotFoundException();
    }
  }
}
