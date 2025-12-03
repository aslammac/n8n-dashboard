import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { Download, DownloadSchema } from './schemas/download.schema';
import { UsersModule } from '../users/users.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Download.name, schema: DownloadSchema }]),
    UsersModule,
    WorkflowsModule,
  ],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
