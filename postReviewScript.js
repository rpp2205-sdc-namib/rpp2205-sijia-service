// import http from 'k6/http';
// import { check, sleep } from 'k6';
// import { Rate } from 'k6/metrics';

// export const errorRate = new Rate('errors');

// export default function () {
//   const url = 'http://localhost:3300/reviews';
//   const params = {
//     product_id: 71697
//   };

//   check(http.get(url), {
//     'status is 200': (r) => r.status == 200,
//   }) || errorRate.add(1);
//   sleep(1);
// }

import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  insecureSkipTLSVerify: true,
  noConnectionReuse: false,
  // scenarios: {
  //   constant_request_rate: {
  //     executor: 'constant-arrival-rate',
  //     rate: 100,
  //     timeUnit: '1s',
  //     duration: '1m',
  //     preAllocatedVUs: 20,
  //     maxVUs: 50,
  //   },
  // }
  vus: 5,
  duration: '2m',
  target: 1000,
  thresholds: {
    http_req_duration: ['max<2000'],
    http_req_failed: ['rate<.01'],
    http_reqs: ['count>=100']
  }
  // stages: [
  //   { duration: '2m', target: 100 }, // below normal load
  //   { duration: '5m', target: 100 },
  //   { duration: '2m', target: 200 }, // normal load
  //   { duration: '5m', target: 200 },
  //   { duration: '2m', target: 300 }, // around the breaking point
  //   { duration: '5m', target: 300 },
  //   { duration: '2m', target: 400 }, // beyond the breaking point
  //   { duration: '5m', target: 400 },
  //   { duration: '10m', target: 0 }, // scale down. Recovery stage.
  // ],
};

export default function () {
  const BASE_URL = 'http://localhost:3300/reviews'; // make sure this is not production
  var randomProductId = Math.floor(Math.random() * 1000011) + 1;
  const responses = http.batch([
    ['GET', `${BASE_URL}/?count=15&sort=helpful&product_id=${randomProductId}`],
    ['GET', `${BASE_URL}/meta?product_id=${randomProductId}`]
  ]);
}