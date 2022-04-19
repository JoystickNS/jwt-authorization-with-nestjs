import { Module } from "@nestjs/common";
import { TokensService } from "./tokens.service";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  providers: [TokensService],
  imports: [JwtModule.register({}), ScheduleModule.forRoot()],
  exports: [TokensService],
})
export class TokensModule {}
