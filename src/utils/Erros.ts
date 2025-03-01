import { RpcException } from '@nestjs/microservices';

export class Errors {
  constructor() {}

  static NError(message: string, statusCode?: number) {
    if (statusCode) {
      throw new RpcException({
        message: message,
        statusCode: statusCode,
      });
    }

    throw new RpcException({
      message: message,
    });
  }
}
