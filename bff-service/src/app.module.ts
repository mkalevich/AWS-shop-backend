import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyService } from './proxy/proxy.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ProxyService],
})
export class AppModule {}
