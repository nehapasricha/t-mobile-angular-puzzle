/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from 'hapi';
import { environment } from './environments/environment';
const Request = require('request-promise');
const CatBoxMemory = require('@hapi/catbox-memory');

const init = async () => {
  const server = new Server({
    port: 3333,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['http://localhost:4200'],
        headers: ['Authorization'],
        exposedHeaders: ['Accept'],
        additionalExposedHeaders: ['Accept'],
        maxAge: 60,
        credentials: true
      }
    },
    cache: {
      name: 'stocksCache',
      engine: new CatBoxMemory()
    }
  });

  const stocksDataCache = server.cache({
    cache: 'stocksCache',
    expiresIn: 1000 * 3600 * 24 * 30, // 30 days
    segment: 'stocksCache'
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return {
        hello: 'world'
      };
    }
  });

  server.route({
    method: 'GET',
    path: '/beta/stock/{symbol}/chart/{period}',
    handler: async (request, h) => {
      const { symbol, period } = request.params;
      const token = request.query.token;
      const cachedData = await stocksDataCache.get(`${symbol}.${period}`);
      if (cachedData) {
        return cachedData;
      } else {
        let response = await Request.get(
          `${
            environment.apiURL
          }/beta/stock/${symbol}/chart/${period}?token=${token}`
        );
        await stocksDataCache.set(`${symbol}.${period}`, response);
        return response;
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
