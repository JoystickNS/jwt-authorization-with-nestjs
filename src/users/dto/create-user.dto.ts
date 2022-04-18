import { IsString, Length } from "class-validator";

export class CreateUserDto {
  @IsString()
  @Length(6, 30)
  readonly login: string;

  @IsString()
  @Length(8, 30)
  readonly password: string;
}
