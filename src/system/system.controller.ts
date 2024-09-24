import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserType,
} from '@Common';
import { SystemService } from './system.service';
import { UpdateSystemSettingsRequestDto } from './dto';

@ApiTags('System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('system')
export class SystemController extends BaseController {
  constructor(private readonly systemService: SystemService) {
    super();
  }

  @Get('settings')
  async getAllSettings(@Req() req: AuthenticatedRequest) {
    const ctx = this.getContext(req);
    return this.systemService.getAllSettings(undefined, {
      userContext: ctx.user.type,
    });
  }

  @Roles(UserType.Admin)
  @UseGuards(RolesGuard)
  @Patch('settings')
  async updateSettings(@Body() data: UpdateSystemSettingsRequestDto) {
    return await this.systemService.updateSettings(data.data);
  }
}
