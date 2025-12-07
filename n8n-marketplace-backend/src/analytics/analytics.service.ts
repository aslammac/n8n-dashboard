import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Workflow, WorkflowDocument } from '../workflows/schemas/workflow.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Workflow.name) private workflowModel: Model<WorkflowDocument>,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalWorkflows, recentUsers, totalDownloads, activeUsers] = await Promise.all([
      this.userModel.countDocuments(),
      this.workflowModel.countDocuments(),
      this.userModel.find().sort({ createdAt: -1 }).limit(5).select('-passwordHash'),
      this.workflowModel.aggregate([
        { $group: { _id: null, total: { $sum: '$downloadsCount' } } }
      ]).then(res => res[0]?.total || 0),
      this.userModel.countDocuments({ emailVerified: true }),
      
    ]);
  

    return {
      totalUsers,
      totalWorkflows,
      totalDownloads,
      recentUsers,
      activeUsers,  
    };
  }
}
