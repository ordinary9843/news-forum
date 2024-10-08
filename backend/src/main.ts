import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';

import { AppModule } from './apis/app/module';
import { HttpExceptionFilter } from './filters/http-exception/filter';
import { HttpResponseInterceptor } from './interceptors/http-response/interceptor';

const initSwagger = (app: NestExpressApplication) => {
  if (process.env.SERVER_MODE === 'prod') return;

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .addBearerAuth()
        .setTitle('News Forum')
        .setDescription('News Forum API documentation')
        .setVersion('1.0')
        .build(),
    ),
    {
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    },
  );
};

async function bootstrap() {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalFilters(app.get(HttpExceptionFilter));
  app.useGlobalInterceptors(app.get(HttpResponseInterceptor));
  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '10mb' }));

  initSwagger(app);

  await app.listen(3000);
}

bootstrap();
