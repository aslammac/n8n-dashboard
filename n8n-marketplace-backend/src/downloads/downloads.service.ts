import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Download, DownloadDocument } from './schemas/download.schema';
import { UsersService } from '../users/users.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { PaymentsService } from '../payments/payments.service';

// Monthly free-download caps.
const FREE_TIER_MONTHLY_LIMIT = 3; // signed-in "free" plan users
const ANON_MONTHLY_LIMIT = 10; // per-IP cap for logged-out visitors

@Injectable()
export class DownloadsService {
  constructor(
    @InjectModel(Download.name) private downloadModel: Model<DownloadDocument>,
    private usersService: UsersService,
    private workflowsService: WorkflowsService,
    private paymentsService: PaymentsService,
  ) {}

  async trackDownload(
    userId: string | undefined,
    workflowId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const workflow = await this.workflowsService.findById(workflowId);
    if (!workflow) {
      throw new ForbiddenException('Workflow not found');
    }

    // --- Anonymous visitor ---
    if (!userId) {
      if (workflow.isPremium) {
        throw new UnauthorizedException(
          'Please sign in to download premium workflows.',
        );
      }

      const anonCount = await this.countMonthlyDownloads({ ipAddress });
      if (anonCount >= ANON_MONTHLY_LIMIT) {
        throw new ForbiddenException(
          'Download limit reached. Please sign in to keep downloading.',
        );
      }

      await this.saveDownload(null, workflow._id, 'free', ipAddress, userAgent);
      await this.workflowsService.incrementDownloads(workflowId);
      return workflow.workflowJson;
    }

    // --- Signed-in user ---
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException('User or Workflow not found');
    }

    let downloadType = 'free';
    if (workflow.isPremium) {
      // Premium workflows need account-level access: an active Pro subscription
      // or a lifetime purchase. It is not tied to individual workflows.
      if (await this.paymentsService.hasPremiumAccess(userId)) {
        downloadType =
          user.subscriptionTier === 'lifetime' ? 'paid' : 'subscription';
      } else {
        throw new ForbiddenException(
          'Premium workflows require a Pro subscription or lifetime access.',
        );
      }
    } else if (user.subscriptionTier === 'free') {
      const count = await this.countMonthlyDownloads({
        userId: user._id,
        downloadType: 'free',
      });
      if (count >= FREE_TIER_MONTHLY_LIMIT) {
        throw new ForbiddenException(
          `Free tier download limit reached (${FREE_TIER_MONTHLY_LIMIT}/month)`,
        );
      }
    }

    await this.saveDownload(
      user._id,
      workflow._id,
      downloadType,
      ipAddress,
      userAgent,
    );
    await this.workflowsService.incrementDownloads(workflowId);

    // Return workflow JSON
    return workflow.workflowJson;
  }

  private startOfMonth(): Date {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private countMonthlyDownloads(
    match: Record<string, unknown>,
  ): Promise<number> {
    return this.downloadModel
      .countDocuments({ ...match, downloadedAt: { $gte: this.startOfMonth() } })
      .exec();
  }

  private saveDownload(
    userId: unknown,
    workflowId: unknown,
    downloadType: string,
    ipAddress: string,
    userAgent: string,
  ) {
    return new this.downloadModel({
      userId,
      workflowId,
      downloadType,
      ipAddress,
      userAgent,
      downloadedAt: new Date(),
    }).save();
  }

  async getUserDownloads(userId: string) {
    return this.downloadModel.find({ userId }).populate('workflowId').exec();
  }
}
