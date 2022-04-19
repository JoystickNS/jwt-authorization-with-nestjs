import * as fs from "fs";
import * as path from "path";

export default () => ({
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  privateKey: fs.readFileSync(
    path.resolve(__dirname, "..\\..\\private.key"),
    "utf8"
  ),
  publicKey: fs.readFileSync(
    path.resolve(__dirname, "..\\..\\public.key"),
    "utf8"
  ),
  accessTokenAliveTime:
    (Number(process.env.ACCESS_TOKEN_ALIVE_TIME_MINUTES) || 15) * 60 * 1000,
  refreshTokenAliveTime:
    (Number(process.env.REFRESH_TOKEN_ALIVE_TIME_DAYS) || 60) *
    24 *
    60 *
    60 *
    1000,
  maxMemorizedTokens: Number(process.env.MAX_SESSIONS_PER_ACC) || 5,
});
