import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Workflow } from '../../workflows/schemas/workflow.schema';

export type PurchaseDocument = Purchase & Document;

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workflow', required: true })
  workflowId: Workflow;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 'stripe' })
  paymentProvider: string;

  @Prop()
  stripePaymentIntentId: string;

  @Prop({ enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' })
  status: string;

  @Prop()
  creatorPayout: number;

  @Prop()
  platformFee: number;

  @Prop({ default: false })
  creatorPaidOut: boolean;

  @Prop()
  completedAt: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
