import { Injectable } from '@nestjs/common';
import { Prisma, Setting, SettingOption, SystemSetting } from '@prisma/client';
import { UserType, UtilsService } from '@Common';
import { SettingsService } from '../settings';

@Injectable()
export class SystemService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly settingsService: SettingsService,
  ) {}

  async getAllSettings(
    mappedTo?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: { userContext?: UserType },
  ): Promise<
    (Setting & {
      options: SettingOption[];
      selection: Prisma.JsonValue | null;
    })[]
  > {
    return await this.settingsService.getSystemSettings(mappedTo);
  }

  async updateSettings(
    data: {
      settingId: number;
      enable?: boolean;
      selection?: string;
      selections?: string[];
    }[],
  ): Promise<SystemSetting[]> {
    return await this.utilsService.batchable(
      data,
      async (item) =>
        await this.settingsService.updateSystemSetting({
          settingId: item.settingId,
          enable: item.enable,
          selection: item.selection,
          selections: item.selections,
        }),
    );
  }
}
