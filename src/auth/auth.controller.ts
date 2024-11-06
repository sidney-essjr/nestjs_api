import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { Users } from '@prisma/client';
import { join } from 'path';
import { User } from 'src/decorators/user.decorator';
import { FileService } from 'src/file/file.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthService } from './auth.service';
import { AuthForgetDTO } from './dto/auth-forget.dto';
import { AuthLoginDTO } from './dto/auth-login.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { AuthResetDTO } from './dto/auth-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileService: FileService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: AuthLoginDTO) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() body: AuthRegisterDTO) {
    return this.authService.register(body);
  }

  @Post('forget')
  async forget(@Body() { email }: AuthForgetDTO) {
    return this.authService.forget(email);
  }

  @Post('reset')
  async reset(@Body() { password, token }: AuthResetDTO) {
    return this.authService.reset(password, token);
  }

  @UseGuards(AuthGuard)
  @Post('me')
  async me(@User('email') user: Users) {
    return user;
  }

  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @Post('files')
  async uploadFiles(
    @User() user: Users,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /^(image\/png|image\/jpeg|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/,
          }),
          new MaxFileSizeValidator({ maxSize: 1024 * 50 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const path = join(
      __dirname,
      '..',
      '..',
      'storage',
      'files',
      `photo-${user.id}.png`,
    );
    return this.fileService.upload(path, file);
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'photo',
        maxCount: 2,
      },
      {
        name: 'documents',
        maxCount: 4,
      },
    ]),
  )
  @UseGuards(AuthGuard)
  @Post('file-fields')
  async uploadFileFields(
    @UploadedFiles()
    fieds: {
      photo: Express.Multer.File;
      document: Express.Multer.File;
    },
  ) {
    return { fieds };
  }
}
