import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProxyService } from './proxy/proxy.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [ProxyService],
})
export class AppModule {}
