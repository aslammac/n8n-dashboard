import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';

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

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post()
  create(@Body() createWorkflowDto: any, @Request() req: any) {
    return this.workflowsService.create(createWorkflowDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Get()
  findAll(@Query() query: any) {
    return this.workflowsService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.workflowsService.findOne(slug);
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
