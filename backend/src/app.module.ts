import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { DemoModule } from "./demo/demo.module";
import { ArticlesModule } from "./articles/articles.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RequestIdMiddleware } from "./common/request-id.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "sqlite",
        database: configService.get("DATABASE_NAME") || "database.sqlite",
        autoLoadEntities: true,
        synchronize: configService.get("DATABASE_SYNCHRONIZE") === "true",
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DemoModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
