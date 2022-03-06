import { Module } from "@nestjs/common";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { TokensModule } from "./tokens/tokens.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    TokensModule,
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
