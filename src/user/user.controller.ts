import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ParamId } from 'src/decorators/param-id.decoratos';
import { Roles } from 'src/decorators/role.decoratos';
import { Role } from 'src/enums/role.enums';
import { RoleGuard } from 'src/guards/role.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.Admin)
  @Post()
  async create(@Body() data: CreateUserDTO) {
    return this.userService.create(data);
  }

  @Roles(Role.Admin)
  @Get()
  async readAll() {
    return this.userService.readAll();
  }

  @Roles(Role.User)
  @Get(':id')
  async read(@ParamId() id: number) {
    return this.userService.read(id);
  }

  @Roles(Role.Admin)
  @Put(':id')
  async update(@ParamId() id: number, @Body() data: UpdatePutUserDTO) {
    return this.userService.update(id, data);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  async partialUpdate(@ParamId() id: number, @Body() data: UpdatePatchUserDTO) {
    return this.userService.partialUpdate(id, data);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async delete(@ParamId() id: number) {
    return this.userService.delete(id);
  }
}
