import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Worlds!';
  }

  create(myBody: { someKey: string }) {
    return 'Your Variable:: ' + (myBody?.someKey || 'Nothing');
  }
}
