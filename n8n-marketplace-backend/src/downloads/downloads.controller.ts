import { Controller, Post, Param, UseGuards, Request, Ip, Headers, Get } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  // Public endpoint: anonymous visitors may download FREE workflows (rate-limited
  // by IP). Premium workflows still require a signed-in user — enforced in the service.
  @UseGuards(OptionalJwtAuthGuard)
  @Post(':workflowId')
  async download(
    @Param('workflowId') workflowId: string,
    @Request() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.downloadsService.trackDownload(req.user?.userId, workflowId, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Get('my')
  async getMyDownloads(@Request() req: any) {
    return this.downloadsService.getUserDownloads(req.user.userId);
  }
}
