import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Workflow } from '../../workflows/schemas/workflow.schema';

export type DownloadDocument = Download & Document;

@Schema({ timestamps: { createdAt: 'downloadedAt', updatedAt: false } })
export class Download {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workflow', required: true })
  workflowId: Workflow;

  @Prop({ enum: ['free', 'paid', 'subscription'], required: true })
  downloadType: string;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  downloadedAt: Date;
}

export const DownloadSchema = SchemaFactory.createForClass(Download);
