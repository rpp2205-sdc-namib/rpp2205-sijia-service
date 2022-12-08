const client = require('../db/index.js');
const helper = require('./helperFunctions.js');

module.exports = {
  getReviews: (product_id, count, sort, callback) => {
    client.query("select * from product where id = 2").then(res => {
    })
    client.query(helper.getReviewIdsQuery(product_id))
      .then((res) => {
        var { review_ids } = res.rows[0];
        var promises = [];
        review_ids.forEach(review_id => {
          promises.push(client.query(helper.getReviewsQuery(review_id)));
        });
        Promise.all(promises)
           .then(arr => {
            arr = arr.map(element => element.rows[0].json_agg[0]);
            var result = {product: Number(product_id), page: 1, results: helper.handleCountAndSort(arr, count, sort)};
            callback(null, result)
           })
      })
      .catch(err => {
        callback(err);
      })
  },

  getMeta: (product_id, callback) => {
    var meta_promises = [client.query(helper.getCharacteristicsQuery(product_id)), client.query(helper.getMetaQuery(product_id))];
    Promise.all(meta_promises)
      .then(arr => {
        var result = arr[1].rows[0].json_build_object;
        var charas = arr[0].rows[0].characteristics;
        for (var key of Object.keys(charas)) {
          result.characteristics[key.toLowerCase()].id = charas[key];
        }
        callback(null, result)
      })
      .catch(err => {
        callback(err);
      })
  },

  postReviewsToDB: (obj, callback) => {
    client.query(helper.postReviewQuery(obj))
      .then(result => {
        callback(null, result)
      })
      .catch(err => {
        callback(err);
      })
  },

  updateHelpfulness: (review_id, callback) => {
    client.query(helper.putQuery(review_id, 'helpful'))
      .then((res) => {
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