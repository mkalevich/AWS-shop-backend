import { All, Controller, Get, Req } from '@nestjs/common';
import { ProxyService } from './proxy/proxy.service';
import { config } from 'dotenv';

config();

@Controller()
export class AppController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxy(@Req() request): Promise<any> {
    let redirectedUrl = '';

    if (request.url.endsWith('products')) {
      redirectedUrl = process.env.PRODUCT;
    }

    try {
      const response = await this.proxyService.proxyRequest(
        redirectedUrl,
        request.method,
        request.body,
      );

      return response;
    } catch (e) {
      console.error(e.response.data);
    }
  }
}
