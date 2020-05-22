/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from 'hapi';
import { stocksPlugin } from './plugins/stocks.plugin';
const CatBoxMemory = require('@hapi/catbox-memory');

const init = async () => {
  const server = new Server({
    port: 3333,
    host: 'localhost',
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

  await server.register({
    plugin: stocksPlugin,
    options: {
      cache: stocksDataCache
    }
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

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
