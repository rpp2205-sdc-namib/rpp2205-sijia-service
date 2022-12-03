const { getReviews, getMeta, updateHelpfulness, updateReported } = require('../models/methods');

module.exports = {
  getAllReviews: (req, res) => {
    var product_id = req.query.product_id;
    var count = req.query.count || 5;
    var sort = req.query.sort;
    getReviews(product_id, count, sort, (err, result) => {
      if (err) {
        res.status(500).send(err)
      } else {
        res.status(200).send(result);
      }
    })
  },

  getMetaReviews: (req, res) => {
    var product_id = req.query.product_id;
    getMeta(product_id, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(result);
      }
    })
  },

  putHelpfulness: (req, res) => {
    var review_id = req.params.review_id;
    updateHelpfulness(review_id, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(204).send(result);
      }
    })
  },

  putReported: (req, res) => {
    var review_id = req.params.review_id;
    updateReported(review_id, (err, result) => {
      if(err) {
        res.status(500).send(err);
      } else {
        res.status(204).send(result);
      }
    })


  }
}