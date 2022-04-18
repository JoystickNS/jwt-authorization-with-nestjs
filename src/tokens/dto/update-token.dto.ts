import { IntersectionType, PartialType, PickType } from "@nestjs/mapped-types";
import { CreateTokenDto } from "./create-token.dto";

export class UpdateTokenDto extends IntersectionType(
  PickType(CreateTokenDto, ["refreshToken", "expires", "userAgent"] as const),
  PartialType(PickType(CreateTokenDto, ["rememberMe"] as const))
) {}
