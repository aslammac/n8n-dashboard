import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WorkflowsService } from './workflows.service';
import { Logger } from '@nestjs/common';

@Processor('workflows')
export class WorkflowsProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowsProcessor.name);

  constructor(private readonly workflowsService: WorkflowsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'bulk-upload': {
        const { workflows, userId } = job.data;
        return this.workflowsService.executeBulkUpload(workflows, userId, (p) =>
          job.updateProgress(p),
        );
      }
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }
}
