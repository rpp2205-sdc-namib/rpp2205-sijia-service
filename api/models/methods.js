const client = require('../db/index.js');
const helper = require('./helperFunctions.js');

module.exports = {
  getReviews: (product_id, count, sort, callback) => {
    client.query("select * from product where id = 2").then(res => {
    })
    client.query(helper.getReviewIdsQuery(product_id))
      .then((res) => {
        var review_ids = res.rows[0].review_ids;
        var promises = [];
        review_ids.forEach(review_id => {
          promises.push(client.query(helper.getReviewsQuery(review_id)));
        });
        Promise.all(promises)
           .then(arr => {
            arr = arr.map(element => element.rows[0].json_agg[0]);
            var result = {product: product_id, page: 1, results: helper.handleCountAndSort(arr, count, sort)};
            callback(null, result)
           })
      })
      .catch(err => {
        callback(err);
      })
  },

  getMeta: (product_id, callback) => {
    client.query(helper.getMetaQuery(product_id))
      .then(result => {
        callback(null, result.rows[0].json_build_object)
      })
      .catch(err => {
        callback(err);
      })
  },

  updateHelpfulness: (review_id, callback) => {
    client.query(helper.putQuery(review_id, 'helpful'))
      .then((res) => {
        console.log('update helpflness', res)
        callback(null, res);
      })
      .catch(err => {
        callback(err);
      })
  },

  updateReported: (review_id, callback) => {
    client.query(helper.putQuery(review_id, 'reported'))
      .then(res => {
        console.log('update reported', res)
        callback(null, res)
      })
      .catch(err => {
        callback(err);
      })
  }
}