import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkflowsService } from "./workflows.service";
import { WorkflowsController } from "./workflows.controller";
import { Workflow, WorkflowSchema } from "./schemas/workflow.schema";
import { Rating, RatingSchema } from "./schemas/rating.schema";
import { BullModule } from '@nestjs/bullmq';
import { UsersModule } from '../users/users.module';
import { WorkflowsProcessor } from './workflows.processor';
import { NotificationsModule } from '../notifications/notifications.module';
import { isRedisEnabled } from '../config/redis.config';

import { WorkflowAiService } from './workflow-ai.service';

const redisEnabled = isRedisEnabled();

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workflow.name, schema: WorkflowSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
    // Queue registration requires BullModule.forRoot — only when Redis is on.
    ...(redisEnabled ? [BullModule.registerQueue({ name: 'workflows' })] : []),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowAiService,
    // The processor is a Redis/BullMQ worker; drop it when Redis is off.
    ...(redisEnabled ? [WorkflowsProcessor] : []),
  ],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
