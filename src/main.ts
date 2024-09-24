// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import path from 'path';
import * as bodyParser from 'body-parser';
import compression from 'compression';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService, ConfigType } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {
  AllExceptionsFilter,
  EnvironmentVariables,
  LoggerService,
  UtilsService,
} from '@Common';
import { appConfigFactory } from '@Config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const logger = new LoggerService();
  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  const utilsService = app.get(UtilsService);
  const appConfig = app.get<ConfigType<typeof appConfigFactory>>(
    appConfigFactory.KEY,
  );

  app.use(bodyParser.json({ limit: appConfig.httpPayloadMaxSize }));
  app.use(
    bodyParser.urlencoded({
      limit: appConfig.httpPayloadMaxSize,
      extended: true,
    }),
  );
  app.use(compression({ level: 1 }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
      stopAtFirstError: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
  const origins = appConfig.domain
    ? [
        new RegExp(
          `^http[s]{0,1}://(?:${appConfig.domain}|[a-z0-9-]+.${appConfig.domain})$`,
        ),
      ]
    : [];
  app.enableCors({
    origin: utilsService.isProductionApp()
      ? origins
      : [
          'null',
          new RegExp(`^http[s]{0,1}://(?:127.0.0.1|localhost)(:[0-9]+)*$`),
          ...origins,
        ],
    credentials: true,
  });
  app.use(cookieParser());
  app.use(
    helmet.crossOriginResourcePolicy({
      policy: utilsService.isProductionApp() ? 'same-site' : 'cross-origin',
    }),
  );
  app.enableShutdownHooks();
  app.useStaticAssets(
    path.join(process.cwd(), configService.get('STORAGE_DIR')),
    { prefix: `/${configService.get('STORAGE_DIR')}` },
  );
  app.useStaticAssets(path.join(process.cwd(), 'static'));

  const config = new DocumentBuilder()
    .setTitle(appConfig.platformName || '')
    .addServer(appConfig.serverUrl || '')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-spec', app, document, {
    customSiteTitle: `${
      appConfig.platformName || ''
    } OpenAPI Specification`.trim(),
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(configService.get('PORT'));

  // Send messages to the parent process if server spawned with an IPC channel
  if (process.send) {
    process.send('ready');
  }

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { promise, reason });
  });
}
bootstrap();
