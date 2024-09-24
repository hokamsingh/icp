import crypto from 'crypto';
import { join, extname } from 'path';
import { URL } from 'url';
import fsPromises from 'fs/promises';
import multer from 'multer';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { appConfigFactory, storageConfigFactory } from '@Config';
import { UtilsService } from './utils.service';

@Injectable()
export class StorageService {
  diskDestination: string;
  defaultMulterOptions: MulterOptions;

  constructor(
    @Inject(appConfigFactory.KEY)
    private readonly appConfig: ConfigType<typeof appConfigFactory>,
    @Inject(storageConfigFactory.KEY)
    private readonly config: ConfigType<typeof storageConfigFactory>,
    private readonly utilsService: UtilsService,
  ) {
    this.diskDestination = this.config.diskDestination as string;
    this.defaultMulterOptions = {
      storage: multer.diskStorage({
        destination: this.diskDestination,
        filename: (req, file, cb) => {
          const extension = extname(file.originalname);
          const hash = crypto
            .createHash('md5')
            .update(file.originalname + this.utilsService.generateRandomToken())
            .digest('hex');
          cb(null, hash + extension);
        },
      }),
      limits: { fileSize: this.config.maxFileSize },
      fileFilter: (req, file, cb) => {
        const extension = extname(file.originalname);

        if (this.config.fileExtensions.includes(extension)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Unsupported file type, Only allowed ${this.config.fileExtensions.join(
                ', ',
              )}`,
            ),
            false,
          );
        }
      },
    };
    this.checkPermissions();
  }

  private async checkPermissions(): Promise<void> {
    await fsPromises.access(
      join(this.diskDestination),
      fsPromises.constants.W_OK | fsPromises.constants.R_OK,
    );
  }

  async createDir(...path: string[]): Promise<void> {
    await fsPromises.mkdir(join(this.diskDestination, ...path), {
      recursive: true,
    });
  }

  async removeDir(...path: string[]): Promise<void> {
    const dirPath = join(...path);
    if (await this.exist(dirPath)) {
      return await fsPromises.rmdir(join(this.diskDestination, dirPath));
    }
  }

  async removeFile(...path: string[]): Promise<void> {
    const filePath = join(...path);
    if (await this.exist(filePath)) {
      return await fsPromises.unlink(join(this.diskDestination, filePath));
    }
  }

  async exist(...path: string[]): Promise<boolean> {
    try {
      await fsPromises.access(join(this.diskDestination, ...path));
      return true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        return false;
      }
      throw e;
    }
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return await fsPromises.rename(
      join(this.diskDestination, oldPath),
      join(this.diskDestination, newPath),
    );
  }

  async move(
    fileOrDir: string,
    newDirPath: string,
    currentDirPath = '',
  ): Promise<void> {
    const fileOrDirPath = join(currentDirPath, fileOrDir);
    if (
      !(await this.exist(fileOrDirPath)) &&
      !(await this.exist(join(newDirPath, fileOrDir)))
    ) {
      throw new Error(
        `No such file or directory exist, path ${join(
          this.diskDestination,
          fileOrDirPath,
        )}`,
      );
    }

    if (!(await this.exist(newDirPath))) {
      await this.createDir(newDirPath);
    }
    return await this.rename(
      join(currentDirPath, fileOrDir),
      join(newDirPath, fileOrDir),
    );
  }

  async moveAll(
    filesOrDirs: string[],
    newDirPath: string,
    currentDirPath = '',
  ): Promise<void> {
    if (!(await this.exist(newDirPath))) {
      await this.createDir(newDirPath);
    }

    await Promise.all(
      filesOrDirs.map(async (fileOrDir) => {
        const fileOrDirPath = join(currentDirPath, fileOrDir);
        if (
          !(await this.exist(fileOrDirPath)) &&
          !(await this.exist(join(newDirPath, fileOrDir)))
        ) {
          throw new Error(
            `No such file or directory exist, path ${join(
              this.diskDestination,
              fileOrDirPath,
            )}`,
          );
        }
      }),
    );

    await Promise.all(
      filesOrDirs.map((fileOrDir) =>
        this.rename(
          join(currentDirPath, fileOrDir),
          join(newDirPath, fileOrDir),
        ),
      ),
    );
  }

  getFileUrl(file: string, dir?: string): string {
    const filePath = join(this.diskDestination, dir || '', file);
    return new URL(filePath, this.appConfig.serverUrl).href;
  }
}
