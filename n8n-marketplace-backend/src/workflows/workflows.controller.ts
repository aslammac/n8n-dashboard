import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, Ip } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles('admin')
  @Post('bulk')
  async bulkUpload(@Body() body: { workflows: any[] }, @Request() req: any) {
    // Start async processing
    this.workflowsService.processBulkUpload(body.workflows, req.user.userId);
    return { message: 'Bulk upload started', count: body.workflows.length };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles('admin')
  @Patch(':id/premium')
  async togglePremium(@Param('id') id: string) {
    return this.workflowsService.togglePremium(id);
  }

  // Removed separate view endpoint, now handled in findOne
  // @Post(':id/view')
  // async incrementViews(@Param('id') id: string) {
  //   return this.workflowsService.incrementViews(id);
  // }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post()
  create(@Body() createWorkflowDto: any, @Request() req: any) {
    return this.workflowsService.create(createWorkflowDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post(':id/rate')
  async rateWorkflow(
    @Param('id') id: string,
    @Body() body: { rating: number; comment?: string },
    @Request() req: any
  ) {
    return this.workflowsService.rateWorkflow(id, req.user.userId, body.rating, body.comment);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(@Query() query: any) {
    return this.workflowsService.findAll(query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  async findOne(@Param('slug') slug: string, @Request() req: any, @Ip() ip: string) {
    const workflow = await this.workflowsService.findOne(slug);

    // Increment views with IP check
    await this.workflowsService.incrementViews(workflow._id.toString(), ip);

    // Premium workflows: the listing (title, description, price, node list) is
    // public so people can decide to buy, but the workflowJson is withheld until
    // the viewer has access. Actual purchase entitlement is enforced on download.
    if (workflow.isPremium) {
      const user = req.user;
      const creatorId = String((workflow.creatorId as any)?._id ?? workflow.creatorId);
      const hasAccess =
        !!user &&
        ((user.subscriptionTier && user.subscriptionTier !== 'free') ||
          user.userId === creatorId ||
          (user.roles ?? []).includes('admin'));

      if (!hasAccess) {
        const plain = workflow.toObject();
        return { ...plain, workflowJson: null, locked: true };
      }
    }

    return workflow;
  }

  @Get(':id/recommendations')
  async getRecommendations(@Param('id') id: string) {
    return this.workflowsService.getRecommendations(id);
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkflowDto: any, @Request() req: any) {
    return this.workflowsService.update(id, updateWorkflowDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.workflowsService.remove(id, req.user.userId);
  }
}
