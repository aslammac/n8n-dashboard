import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { StripeProvider } from './stripe.provider';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Purchase.name, schema: PurchaseSchema }]),
    UsersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
