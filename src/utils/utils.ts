import { CookieOptions } from "express";
import configuration from "../config/configuration";

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "auth",
};

const refreshTokenAliveTime = configuration().refreshTokenAliveTime;

export const calcTokenLifeTime = () => {
  return new Date(Date.now() + refreshTokenAliveTime);
};
