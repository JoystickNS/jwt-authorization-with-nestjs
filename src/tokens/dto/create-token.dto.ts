import { IsBoolean, IsDate, IsInt, IsString, MaxLength } from "class-validator";

export class CreateTokenDto {
  @IsString()
  @MaxLength(1000)
  readonly refreshToken: string;

  @IsDate()
  readonly expires?: Date;

  @IsBoolean()
  readonly rememberMe: boolean;

  @IsString()
  readonly userAgent: string;

  @IsInt()
  readonly userId: number;
}
