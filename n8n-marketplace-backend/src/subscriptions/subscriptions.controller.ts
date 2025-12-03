import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMySubscription(@Request() req: any) {
    return this.subscriptionsService.findByUserId(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(@Request() req: any, @Body() body: any) {
    return this.subscriptionsService.createCheckoutSession(req.user.userId, body.priceId);
  }
}
