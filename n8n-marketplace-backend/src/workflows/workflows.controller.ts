import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createWorkflowDto: any, @Request() req: any) {
    return this.workflowsService.create(createWorkflowDto, req.user.userId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.workflowsService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.workflowsService.findOne(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkflowDto: any, @Request() req: any) {
    return this.workflowsService.update(id, updateWorkflowDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.workflowsService.remove(id, req.user.userId);
  }
}
