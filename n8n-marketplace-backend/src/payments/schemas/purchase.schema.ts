import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Workflow } from '../../workflows/schemas/workflow.schema';

export type PurchaseDocument = Purchase & Document;

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  // What the payment unlocks. 'lifetime' = permanent full access;
  // 'subscription' = a Pro checkout; 'workflow' kept for legacy rows.
  @Prop({ enum: ['lifetime', 'subscription', 'workflow'], default: 'lifetime' })
  kind: string;

  // Only set for legacy per-workflow purchases.
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workflow', required: false, default: null })
  workflowId: Workflow | null;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 'stripe' })
  paymentProvider: string;

  @Prop()
  stripePaymentIntentId: string;

  @Prop({ index: true })
  stripeCheckoutSessionId: string;

  @Prop({ enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' })
  status: string;

  @Prop()
  completedAt: Date;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
