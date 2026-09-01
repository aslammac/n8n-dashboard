import {
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Request,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Request() req: any) {
    return this.paymentsService.createSubscriptionCheckout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('lifetime')
  async lifetime(@Request() req: any) {
    return this.paymentsService.createLifetimeCheckout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  async portal(@Request() req: any) {
    return this.paymentsService.createPortalSession(req.user.userId);
  }

  // Stripe calls this directly — no auth guard; verified by signature instead.
  // The raw body is provided by the express.raw() middleware in main.ts.
  @Post('webhook')
  async webhook(@Req() req: any, @Headers('stripe-signature') signature: string) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header.');
    }
    return this.paymentsService.handleWebhook(req.body, signature);
  }

  @UseGuards(JwtAuthGuard)
  @Get('billing')
  async billing(@Request() req: any) {
    return this.paymentsService.getBillingStatus(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/purchases')
  async getMyPurchases(@Request() req: any) {
    return this.paymentsService.findMyPurchases(req.user.userId);
  }
}
