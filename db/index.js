const {Client} = require('pg');

const client = new Client({
  host: '35.163.205.199',
  user: 'ubuntu',
  port: 5432,
  password: 'ubuntu',
  database: 'cts1988'
});

// const nodeCache = new NodeCache({
//   checkperiod: 60,
//   stdTTL: 60,
//   useClones: false,
// });

// const hashQuery = (query)=> {
//   return JSON.stringify(query);
// };

// const pool = createPool('postgres://ubuntu:ubuntu@35.163.205.199:5432/cts1988', {
//   interceptors: [
//     createQueryCacheInterceptor({
//       storage: {
//         get: (query) => {
//           return cache.get(hashQuery(query)) || null;
//         },
//         set: (query, cacheAttributes, queryResult) => {
//           cache.set(hashQuery(query), queryResult, cacheAttributes.ttl);
//         },
//       },
//     }),
//   ]
// });

module.exports = client;
