/* eslint-disable prettier/prettier */
import { MasterAccountService } from './master-account.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CreateMasterAccountDto, CreateSubAccountDto } from './dto';
// import { JwtAuthGuard, ValidatedUser } from '@Common';

@Controller('master-account')
export class MasterAccountController {
  constructor(private readonly masterAccountService: MasterAccountService) {}
  @Post('create')
  async createMasterAccount(@Body() data: CreateMasterAccountDto) {
    const master = await this.masterAccountService.createNewMaster(data.name);
    return { status: 'success', data: master };
  }

  @Post('sub-account')
  async createSubAccount(@Body() data: CreateSubAccountDto) {
    const account = await this.masterAccountService.createSubAccount(
      data.name,
      data.masterAccountId,
    );

    return { status: 'success', data: account };
  }
  @Get('all')
  async getAllMasterAccounts(@Query('search') search?: string) {
    const masterAccounts =
      await this.masterAccountService.getAllMasterAccounts(search);
    return { status: 'success', data: masterAccounts };
  }

  @Get('sub-account/:masterId')
  async getSubAccount(
    @Param('masterId') masterId: number,
    @Query('search') search?: string,
  ) {
    const account = await this.masterAccountService.getSubAccount(
      masterId,
      search,
    );
    return { status: 'success', data: account };
  }

  // // @UseGuards(JwtAuthGuard)
  // @Get('sub-acc/:masterId')
  // async getMasToSubAccount(
  //   @Param('masterId') masterId: number,
  //   @Req() req: Request & { user: ValidatedUser },
  //   @Query('search') search?: string,
  // ) {
  //   const userId = req.user.id;

  //   // console.log( userId);
  //   const account = await this.masterAccountService.getMasToSubAccount(
  //     userId,
  //     masterId,
  //     search,
  //   );

  //   return { status: 'success', data: account };
  // }
}
