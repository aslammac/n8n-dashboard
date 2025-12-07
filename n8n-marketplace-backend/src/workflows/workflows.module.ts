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

import { WorkflowAiService } from './workflow-ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workflow.name, schema: WorkflowSchema },
      { name: Rating.name, schema: RatingSchema },
    ]),
    BullModule.registerQueue({
      name: 'workflows',
    }),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowAiService, WorkflowsProcessor],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
