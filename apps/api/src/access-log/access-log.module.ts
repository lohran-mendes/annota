import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessLog, AccessLogSchema } from './access-log.schema';
import { AccessLogController } from './access-log.controller';
import { AccessLogService } from './access-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessLog.name, schema: AccessLogSchema },
    ]),
  ],
  controllers: [AccessLogController],
  providers: [AccessLogService],
  exports: [AccessLogService, MongooseModule],
})
export class AccessLogModule {}
