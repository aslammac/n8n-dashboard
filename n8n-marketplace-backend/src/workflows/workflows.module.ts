import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkflowsService } from "./workflows.service";
import { WorkflowsController } from "./workflows.controller";
import { Workflow, WorkflowSchema } from "./schemas/workflow.schema";
import { UsersModule } from '../users/users.module';

import { WorkflowAiService } from './workflow-ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workflow.name, schema: WorkflowSchema }]),
    UsersModule,
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowAiService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
