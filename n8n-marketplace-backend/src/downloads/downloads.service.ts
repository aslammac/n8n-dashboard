import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Download, DownloadDocument } from './schemas/download.schema';
import { UsersService } from '../users/users.service';
import { WorkflowsService } from '../workflows/workflows.service';

@Injectable()
export class DownloadsService {
  constructor(
    @InjectModel(Download.name) private downloadModel: Model<DownloadDocument>,
    private usersService: UsersService,
    private workflowsService: WorkflowsService,
  ) {}

  async trackDownload(userId: string, workflowId: string, ipAddress: string, userAgent: string) {
    const user = await this.usersService.findById(userId);
    const workflow = await this.workflowsService.findById(workflowId);

    if (!user || !workflow) {
      throw new ForbiddenException('User or Workflow not found');
    }

    let downloadType = 'free';
    if (workflow.isPremium) {
      // Check subscription or purchase (simplified for now)
      if (user.subscriptionTier === 'free') {
          // Check if purchased (omitted for MVP phase 1, assume no purchase)
          // throw new ForbiddenException('Premium workflow requires subscription or purchase');
          downloadType = 'paid'; // Placeholder
      } else {
          downloadType = 'subscription';
      }
    } else {
      // Free workflow logic
      if (user.subscriptionTier === 'free') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const count = await this.downloadModel.countDocuments({
          userId: user._id,
          downloadedAt: { $gte: startOfMonth },
          downloadType: 'free',
        });

        if (count >= 3) {
          throw new ForbiddenException('Free tier download limit reached (3/month)');
        }
      }
    }

    const download = new this.downloadModel({
      userId: user._id,
      workflowId: workflow._id,
      downloadType,
      ipAddress,
      userAgent,
      downloadedAt: new Date(),
    });

    await download.save();
    await this.workflowsService.incrementDownloads(workflowId);
    
    // Return workflow JSON
    return workflow.workflowJson;
  }

  async getUserDownloads(userId: string) {
    return this.downloadModel.find({ userId }).populate('workflowId').exec();
  }
}
