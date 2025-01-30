import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly morganMiddleware: ReturnType<typeof morgan>;

  constructor() {
    // Configura Morgan con el formato deseado
    this.morganMiddleware = morgan('combined');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.morganMiddleware(req, res, next);
  }
}
