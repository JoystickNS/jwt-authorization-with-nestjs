import { IsString, Length } from "class-validator";

export class CreateUserDto {
  @IsString()
  @Length(6, 30)
  login: string;

  @IsString()
  @Length(8, 30)
  password: string;
}
