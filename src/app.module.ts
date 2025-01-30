import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';

class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

@Module({
  imports: [
    AuthModule,
    UsersModule,
    LoggerModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'user_crud',
      password: 'root',
      database: 'db_crud',
      autoLoadEntities: true,
      synchronize: true, // sincroniza la base de datos con las entidades segun los cambios que se hagan en dev TODO: NO DEBE ESTAR ACTIVADO EN PROD
    }),
  ],
})
export class AppModule {}
