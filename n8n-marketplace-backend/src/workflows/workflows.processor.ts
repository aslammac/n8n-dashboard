import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WorkflowsService } from './workflows.service';
import { Logger } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Processor('workflows')
export class WorkflowsProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowsProcessor.name);

  constructor(
    private readonly workflowsService: WorkflowsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'bulk-upload':
        return this.handleBulkUpload(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async handleBulkUpload(job: Job) {
    const { workflows, userId } = job.data;
    this.logger.log(`Starting bulk upload of ${workflows.length} workflows for user ${userId}`);

    let successCount = 0;
    let failCount = 0;

    for (const workflowData of workflows) {
      try {
        await this.workflowsService.create(workflowData, userId);
        successCount++;
      } catch (error) {
        this.logger.error(`Failed to upload workflow in bulk: ${error.message}`);
        failCount++;
      }
      
      // Update job progress
      const progress = Math.round(((successCount + failCount) / workflows.length) * 100);
      await job.updateProgress(progress);
    }

    this.logger.log(`Bulk upload complete. Success: ${successCount}, Failed: ${failCount}`);
    
    // Notify user
    this.notificationsGateway.sendNotificationToUser(userId, 'upload-complete', {
      successCount,
      failCount,
      total: workflows.length,
    });

    return { successCount, failCount };
  }
}
