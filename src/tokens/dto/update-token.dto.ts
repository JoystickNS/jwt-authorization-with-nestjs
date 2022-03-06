import { PickType } from "@nestjs/mapped-types";
import { CreateTokenDto } from "./create-token.dto";

export class UpdateTokenDto extends PickType(CreateTokenDto, [
  "refreshToken",
  "userAgent",
] as const) {}
