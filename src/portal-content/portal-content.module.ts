import { Global, Module } from '@nestjs/common';
import { PortalContentService } from './portal-content.service';

@Global()
@Module({
  providers: [PortalContentService],
  exports: [PortalContentService],
})
export class PortalContentModule {}
