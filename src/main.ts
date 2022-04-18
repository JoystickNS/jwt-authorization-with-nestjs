import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: ["http://localhost:5000"],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    })
  );
  await app.listen(configService.get("port"));
}
bootstrap();
