import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type WorkflowDocument = Workflow & Document;

@Schema({ timestamps: true })
export class Workflow {
  @Prop({ required: true, index: true })
  title: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ maxlength: 200 })
  shortDescription: string;

  @Prop()
  detailedDescription: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ type: [String], index: true })
  tags: string[];

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'] })
  complexity: string;

  @Prop([String])
  nodes: string[];

  @Prop([String])
  requirements: string[];

  @Prop([String])
  benefits: string[];

  @Prop()
  useCase: string;

  @Prop()
  setupTime: string;

  @Prop([String])
  setupSteps: string[];

  @Prop()
  triggerType: string;

  @Prop({ type: Object })
  workflowJson: any;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creatorId: User;

  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: 'published', enum: ['draft', 'published', 'archived'] })
  status: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 0, index: true })
  downloadsCount: number;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  ratingAverage: number;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;

  @Prop()
  thumbnailUrl: string;

  @Prop([String])
  previewImages: string[];

  @Prop()
  publishedAt: Date;
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
WorkflowSchema.index({ title: 'text', shortDescription: 'text', detailedDescription: 'text', tags: 'text' });
