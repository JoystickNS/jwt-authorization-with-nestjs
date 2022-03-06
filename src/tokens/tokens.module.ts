import { Module } from "@nestjs/common";
import { TokensService } from "./tokens.service";
import { TokensController } from "./tokens.controller";
import { JwtModule } from "@nestjs/jwt";

@Module({
  controllers: [TokensController],
  providers: [TokensService],
  imports: [JwtModule.register({})],
  exports: [TokensService],
})
export class TokensModule {}
