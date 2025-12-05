import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workflow, WorkflowDocument } from './schemas/workflow.schema';
import { UsersService } from '../users/users.service';
import { WorkflowAiService } from './workflow-ai.service';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<WorkflowDocument>,
    private usersService: UsersService,
    private workflowAiService: WorkflowAiService,
    @InjectQueue('workflows') private workflowsQueue: Queue,
  ) {}

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
    return createdWorkflow.save();
  }

  async processBulkUpload(workflows: any[], userId: string) {
    console.log(`Adding bulk upload job for user ${userId} with ${workflows.length} workflows`);
    
    await this.workflowsQueue.add('bulk-upload', {
      workflows,
      userId,
    });
  }

  private slugify(text: string): string {
    return text
      .toString()
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

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slug: string): Promise<WorkflowDocument> {
    const workflow = await this.workflowModel.findOne({ slug }).populate('creatorId', 'fullName avatarUrl username').exec();
    if (!workflow) {
      throw new NotFoundException(`Workflow with slug ${slug} not found`);
    }
    return workflow;
  }

  async findById(id: string): Promise<WorkflowDocument> {
      const workflow = await this.workflowModel.findById(id).exec();
      if (!workflow) {
          throw new NotFoundException(`Workflow with id ${id} not found`);
      }
      return workflow;
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
}
