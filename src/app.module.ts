import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import {
  DOCKER_DB_PORT,
  MYSQL_DATABASE,
  MYSQL_HOST,
  MYSQL_ROOT_PASSWORD,
  MYSQL_USER,
} from './config/envs.config';

class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

@Module({
  imports: [
    UsersModule,
    LoggerModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: MYSQL_HOST,
      port: DOCKER_DB_PORT,
      username: MYSQL_USER,
      password: MYSQL_ROOT_PASSWORD,
      database: MYSQL_DATABASE,
      autoLoadEntities: true,
      // synchronize: true, // sincroniza la base de datos con las entidades segun los cambios que se hagan en dev TODO: NO DEBE ESTAR ACTIVADO EN PROD
    }),
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: 'localhost', //poner 0.0.0.0 cuando se despliegue
        port: 6379,
        ttl: 3600, // 1 hora
      }),
    }),
  ],
  exports: [CacheModule],
})
export class AppModule {}
