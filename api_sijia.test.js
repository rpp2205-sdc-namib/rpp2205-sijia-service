const axios = require('axios');
const { getReviewIdsQuery, getReviewsQuery, getMetaQuery, postReviewQuery, putQuery, handleCountAndSort } = require('./api/models/helperFunctions.js');
const { getAllReviews, getMetaReviews, postReviews, putHelpfulness, putReported } = require('./api/controllers/requestHandlers.js');


describe('test helper function', () => {
  test('getReviewIdsQuery is working properly', () => {
    var result = getReviewIdsQuery(2);
    expect(result.includes('WHERE id = 2')).toBe(true);
  });

  test('getReviewsQuery is working properly', () => {
    var result = getReviewsQuery(1000);
    expect(result.includes('WHERE review_id = 1000')).toBe(true);
  });

  test('getReviewsQuery is working properly', () => {
    var result = getReviewsQuery(1000);
    expect(result.includes('WHERE review_id = 1000')).toBe(true);
  });
});

describe('get reviews route is pulling reviews from api correctly', () => {
  test('test the getreviews request handler is working correctly', () => {
    axios.get('http://localhost:3300/reviews/?count=3&sort=helpful&product_id=120')
      .then(res => {
        expect(res.status).toBe(200);
        var result = res.data;
        expect(result.results.length).toBe(2);
        expect(result.product).toBe('120');
        expect(result.results[0].helpfulness).not.toBeLessThan(result.results[1].helpfulness);
      });
    axios.get('http://localhost:3300/reviews')
      .then(res => {
        expect(res.status).toBe(500);
      })
      .catch(err => {
        expect(err).not.toBeNull();
      })
  });
});

describe('get meta route is working properly', () => {
  test('test the getmeta request handler is working correctly', () => {
    axios.get('http://localhost:3300/reviews/meta?product_id=120')
      .then(res => {
        expect(res.status).toBe(200);
        var result = res.data;
        expect(result.product_id).toBe(120);
        expect(result.ratings).not.toBeNull();
        expect(result.recommended.true).toBe(2);
      })
    axios.get('http://localhost:3300/meta')
      .then(res => {
        expect(res.status).toBe(500);
      })
      .catch(err => {
        expect(err).not.toBeNull();
      })
  })
});

describe('put helpful is working properly', () => {
  test('test put request handler is working correctly', () => {
    axios.put('http://localhost:3300/reviews/1/helpful')
      .then(res => {
        expect(res.status).toBe(204)
      })
  })

  test('test put request handler is working correctly', () => {
    axios.put('http://localhost:3300/reviews/1/helpfulness')
      .then(res => {
        expect(res.status).toBe(500)
      })
      .catch(err => {
        expect(err).not.toBeNull();
      })
  })
})

describe('put reported is working properly', () => {
  test('test put request handler is working correctly', () => {
    axios.put('http://localhost:3300/reviews/1/report')
      .then(res => {
        expect(res.status).toBe(204)
      })
  })

  test('test put request handler is working correctly', () => {
    axios.put('http://localhost:3300/reviews/report')
      .then(res => {
        expect(res.status).toBe(500)
      })
      .catch(err => {
        expect(err).not.toBeNull();
      })
  })
})


