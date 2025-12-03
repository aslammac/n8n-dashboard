import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@Request() req: any, @Body() body: any) {
    return this.paymentsService.createPurchase(req.user.userId, body.workflowId, body.amount);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/purchases')
  async getMyPurchases(@Request() req: any) {
    return this.paymentsService.findMyPurchases(req.user.userId);
  }
}
