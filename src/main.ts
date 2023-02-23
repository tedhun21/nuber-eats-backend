import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';
import { json } from 'body-parser';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4000);

  const typeDefs = readFileSync('./src/schema.gql', 'utf8');
  const resolvers = {
    Query: {},
  };
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
}
bootstrap();
