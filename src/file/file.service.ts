import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { Logger } from 'src/logging/logger.service';

@Injectable()
export class FileService {
  constructor(private readonly logger: Logger) {}
  async upload(path: string, file: Express.Multer.File) {
    if (!path || !file) {
      this.logger.error('Invalid path or file', { path, file });
      throw new BadRequestException('Invalid path or file');
    }

    try {
      return writeFile(path, file.buffer);
    } catch (error) {
      this.logger.error('Error saving the file', { error, path });
      throw new InternalServerErrorException('Error saving the file');
    }
  }
}
