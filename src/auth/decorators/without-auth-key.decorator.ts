import { SetMetadata } from "@nestjs/common";

export const WITHOUT_AUTH_KEY = "WITHOUT_AUTH_KEY";
export const withoutAuthKey = () => SetMetadata(WITHOUT_AUTH_KEY, true);
