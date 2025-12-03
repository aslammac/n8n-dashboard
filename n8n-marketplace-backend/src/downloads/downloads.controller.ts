import { Controller, Post, Param, UseGuards, Request, Ip, Headers, Get } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':workflowId')
  async download(
    @Param('workflowId') workflowId: string,
    @Request() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.downloadsService.trackDownload(req.user.userId, workflowId, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyDownloads(@Request() req: any) {
    return this.downloadsService.getUserDownloads(req.user.userId);
  }
}
