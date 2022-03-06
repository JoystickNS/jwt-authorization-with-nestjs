import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "src/users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { TokensModule } from "src/tokens/tokens.module";

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  imports: [UsersModule, PassportModule, TokensModule],
})
export class AuthModule {}
