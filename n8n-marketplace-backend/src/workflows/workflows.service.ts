import {
  Injectable,
  NotFoundException,
  Inject,
  Optional,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workflow, WorkflowDocument } from './schemas/workflow.schema';
import { Rating, RatingDocument } from './schemas/rating.schema';
import { UsersService } from '../users/users.service';
import { WorkflowAiService } from './workflow-ai.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager'; // Use type import

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<WorkflowDocument>,
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    private usersService: UsersService,
    private workflowAiService: WorkflowAiService,
    // Absent when REDIS_ENABLED=false — bulk uploads then run inline.
    @Optional() @InjectQueue('workflows') private workflowsQueue: Queue | undefined,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // ... (existing methods)

  // ... (existing methods: create, processBulkUpload, togglePremium, slugify, extractNodes, findAll)

  async create(createWorkflowDto: any, userId: string): Promise<WorkflowDocument> {
    let aiData: any = {};

    if (createWorkflowDto.workflowJson) {
      try {
        const jsonString = typeof createWorkflowDto.workflowJson === 'string' 
          ? createWorkflowDto.workflowJson 
          : JSON.stringify(createWorkflowDto.workflowJson);
          
        const analysis = await this.workflowAiService.analyzeWorkflow(jsonString);

        // console.log('AI Analysis:', analysis);
        
        aiData = {
          title: analysis.title,
          complexity: analysis.complexity,
          shortDescription: analysis.shortDescription,
          detailedDescription: analysis.detailedDescription,
          category: analysis.category,
          tags: analysis.tags,
          nodes: analysis.nodes,
          requirements: analysis.requirements,
          benefits: analysis.benefits,
          useCase: analysis.useCase,
          setupTime: analysis.setupTime,
          setupSteps: analysis.setupSteps,
          slug: this.slugify(analysis.title),
        };
      } catch (error) {
        // console.error('AI Analysis failed:', error);
        // Fallback if AI fails
        const title = createWorkflowDto.title || 'Untitled Workflow';
        aiData = {
          title: title,
          complexity: 'intermediate',
          shortDescription: createWorkflowDto.description || '',
          detailedDescription: createWorkflowDto.description || '',
          category: 'Other',
          tags: [],
          nodes: this.extractNodes(createWorkflowDto.workflowJson),
          slug: this.slugify(title + '-' + Date.now()), // Ensure uniqueness
        };
      }
    }

    const createdWorkflow = new this.workflowModel({
      ...createWorkflowDto, // Override with manual data if provided
      ...aiData, // Apply AI/Fallback data
      slug: aiData.slug || this.slugify(createWorkflowDto.title || 'untitled-' + Date.now()), // Ensure slug exists
      creatorId: userId,
      publishedAt: new Date(),
    });
    
    await this.invalidateCache();
    return createdWorkflow.save();
  }

  async processBulkUpload(workflows: any[], userId: string) {
    if (this.workflowsQueue) {
      this.logger.log(
        `Queuing bulk upload for user ${userId} (${workflows.length} workflows)`,
      );
      await this.workflowsQueue.add('bulk-upload', { workflows, userId });
      return;
    }

    // Redis disabled: process synchronously in-process.
    this.logger.log(
      `Redis disabled — running bulk upload inline for user ${userId} (${workflows.length} workflows)`,
    );
    await this.executeBulkUpload(workflows, userId);
  }

  /**
   * Runs the actual bulk import loop. Called by the BullMQ processor when Redis
   * is enabled, or directly by processBulkUpload when it is not.
   */
  async executeBulkUpload(
    workflows: any[],
    userId: string,
    onProgress?: (percent: number) => Promise<unknown>,
  ): Promise<{ successCount: number; failCount: number }> {
    let successCount = 0;
    let failCount = 0;

    for (const workflowData of workflows) {
      try {
        await this.create(workflowData, userId);
        successCount++;
      } catch (error) {
        this.logger.error(
          `Failed to upload workflow in bulk: ${(error as Error).message}`,
        );
        failCount++;
      }

      if (onProgress) {
        const progress = Math.round(
          ((successCount + failCount) / workflows.length) * 100,
        );
        await onProgress(progress);
      }
    }

    this.logger.log(
      `Bulk upload complete for user ${userId}. Success: ${successCount}, Failed: ${failCount}`,
    );

    this.notificationsGateway.sendNotificationToUser(userId, 'upload-complete', {
      successCount,
      failCount,
      total: workflows.length,
    });

    return { successCount, failCount };
  }

  async togglePremium(id: string): Promise<WorkflowDocument | null> {
    const workflow = await this.workflowModel.findById(id);
    if (!workflow) return null;
    workflow.isPremium = !workflow.isPremium;
    await this.invalidateCache(workflow.slug);
    return workflow.save();
  }

  private slugify(text: string): string {
    if (!text) return '';
    return String(text)
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  private extractNodes(workflowJson: any): string[] {
    try {
      const nodes = new Set<string>();
      const json = typeof workflowJson === 'string' ? JSON.parse(workflowJson) : workflowJson;
      
      if (json.nodes && Array.isArray(json.nodes)) {
        json.nodes.forEach((node: any) => {
          if (node.type) {
            // Extract node name from type (e.g., "n8n-nodes-base.httpRequest" -> "httpRequest")
            const parts = node.type.split('.');
            nodes.add(parts[parts.length - 1]);
          }
        });
      }
      return Array.from(nodes);
    } catch (e) {
      return [];
    }
  }

  async findAll(query: any): Promise<{ data: WorkflowDocument[], meta: any }> {
    const cacheKey = `workflows:all:${JSON.stringify(query)}`;
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult as { data: WorkflowDocument[], meta: any };
    }
    const { page = 1, limit = 12, search, category, complexity, tags, sort } = query;
    const skip = (page - 1) * limit;
    const filter: any = { status: 'published', isPublic: true };

    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
      filter.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { detailedDescription: searchRegex },
        { tags: searchRegex },
        { category: searchRegex }
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (complexity) {
      filter.complexity = complexity;
    }
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }
    if (query.isPremium !== undefined) {
      filter.isPremium = query.isPremium === 'true';
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'downloads') sortOption = { downloadsCount: -1 };
    if (sort === 'rating') sortOption = { ratingAverage: -1 };

    const [data, total] = await Promise.all([
      this.workflowModel
        .find(filter)
        .select('-workflowJson -__v') // Exclude heavy fields
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate('creatorId', 'fullName avatarUrl username')
        .exec(),
      this.workflowModel.countDocuments(filter).exec(),
    ]);

    const result = {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cacheManager.set(cacheKey, result, 60 * 1000); // 1 minute TTL for lists
    return result;
  }

  async findOne(slug: string): Promise<WorkflowDocument> {
    const cacheKey = `workflow:${slug}`;
    const cachedWorkflow = await this.cacheManager.get(cacheKey);
    if (cachedWorkflow) {
      return cachedWorkflow as WorkflowDocument;
    }

    const workflow = await this.workflowModel.findOne({ slug }).populate('creatorId', 'fullName avatarUrl username').exec();
    if (!workflow) {
      throw new NotFoundException(`Workflow with slug ${slug} not found`);
    }

    await this.cacheManager.set(cacheKey, workflow, 5 * 60 * 1000); // 5 minutes TTL for details
    return workflow;
  }

  async findById(id: string): Promise<WorkflowDocument> {
      const workflow = await this.workflowModel.findById(id).exec();
      if (!workflow) {
          throw new NotFoundException(`Workflow with id ${id} not found`);
      }
      return workflow;
  }

  async rateWorkflow(id: string, userId: string, rating: number, comment?: string): Promise<WorkflowDocument> {
    const existingRating = await this.ratingModel.findOne({ workflowId: id, userId });

    if (existingRating) {
      existingRating.rating = rating;
      if (comment) existingRating.comment = comment;
      await existingRating.save();
    } else {
      await this.ratingModel.create({
        workflowId: id,
        userId,
        rating,
        comment
      });
    }

    // Recalculate average rating
    const ratings = await this.ratingModel.find({ workflowId: id });
    const total = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const average = total / ratings.length;

    const updatedWorkflow = await this.workflowModel.findByIdAndUpdate(
      id,
      { 
        ratingAverage: parseFloat(average.toFixed(1)),
        ratingCount: ratings.length
      },
      { new: true }
    ).exec();
    
    if (!updatedWorkflow) throw new NotFoundException('Workflow not found');
    await this.invalidateCache(updatedWorkflow.slug);
    return updatedWorkflow;
  }

  private async invalidateCache(slug?: string) {
    if (slug) {
      await this.cacheManager.del(`workflow:${slug}`);
    }
    
    // Clear all list caches
    // Using 'any' cast because cache-manager v5+ types are strict/different
    try {
        const store = (this.cacheManager as any).store;
        if (store && typeof store.keys === 'function') {
            const keys = await store.keys('workflows:all:*');
            if (keys && keys.length > 0) {
                await store.del(keys);
            }
        }
    } catch (e) {
        console.warn('Failed to invalidate list cache', e);
    }
  }

  async update(id: string, updateWorkflowDto: any, userId: string): Promise<WorkflowDocument> {
    const workflow = await this.workflowModel.findOneAndUpdate(
      { _id: id, creatorId: userId },
      updateWorkflowDto,
      { new: true },
    );
    if (!workflow) {
      throw new NotFoundException(`Workflow not found or you are not the owner`);
    }
    return workflow;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.workflowModel.deleteOne({ _id: id, creatorId: userId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Workflow not found or you are not the owner`);
    }
  }

  async incrementDownloads(id: string): Promise<void> {
    await this.workflowModel.findByIdAndUpdate(id, { $inc: { downloadsCount: 1 } });
  }

  async incrementViews(id: string, ip: string): Promise<void> {
    const cacheKey = `view:${id}:${ip}`;
    const hasViewed = await this.cacheManager.get(cacheKey);

    if (!hasViewed) {
      await this.workflowModel.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
      await this.cacheManager.set(cacheKey, 'true', 60 * 60 * 1000); // 1 hour TTL
    }
  }

  async getRecommendations(id: string): Promise<WorkflowDocument[]> {
    const workflow = await this.workflowModel.findById(id);
    if (!workflow) return [];

    return this.workflowModel.find({
      _id: { $ne: id },
      status: 'published',
      isPublic: true,
      $or: [
        { category: workflow.category },
        { tags: { $in: workflow.tags } }
      ]
    })
    .select('title slug shortDescription category ratingAverage downloadsCount isPremium')
    .limit(4)
    .exec();
  }
}
