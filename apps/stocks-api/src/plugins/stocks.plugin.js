const Request = require('request-promise');
import { environment } from './../environments/environment';

export const stocksPlugin = {
  name: 'stocksPlugin',
  version: '1.0.0',
  register: async function (server, options) {
    server.route({
      method: 'GET',
      path: '/api/beta/stock/{symbol}/chart/{period}',
      handler: async (request, h) => {
        const { symbol, period } = request.params;
        const token = request.query.token;

        const cachedData = await options.cache.get(`${symbol}.${period}`);
        if (cachedData) {
          return cachedData;
        } else {
          let response = await Request.get(
            `${
              environment.apiURL
            }/beta/stock/${symbol}/chart/${period}?token=${token}`
          );
          await options.cache.set(`${symbol}.${period}`, response);
          return response;
        }
      }
    });

  }
}


