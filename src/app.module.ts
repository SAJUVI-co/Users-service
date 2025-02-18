import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  ],
})
export class AppModule {}
