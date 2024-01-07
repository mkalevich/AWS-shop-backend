import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
  async proxyRequest(url: string, method: string, data?: any) {
    console.log(data);

    try {
      const response = await axios({ url, method, data });

      return response.data;
    } catch (e) {
      console.error(e);
    }
  }
}
