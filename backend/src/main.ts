import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';

import { HttpExceptionFilter } from './filters/http-exception/filter.js';
import { HttpResponseInterceptor } from './interceptors/http-response/interceptor.js';
import { ServerMode } from './modules/app/enum.js';
import { AppModule } from './modules/app/module.js';

const initSwagger = (app: NestExpressApplication) => {
  if (process.env.SERVER_MODE === ServerMode.PROD) {
    return;
  }

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .addBearerAuth()
        .setTitle('News Forum')
        .setDescription('API documentation')
        .setVersion('1.0')
        .build(),
    ),
    {
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    },
  );
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalFilters(app.get(HttpExceptionFilter));
  app.useGlobalInterceptors(app.get(HttpResponseInterceptor));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(json({ limit: '10mb' }));
  initSwagger(app);
  await app.listen(3000);
}

bootstrap();
