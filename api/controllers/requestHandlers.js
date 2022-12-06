const { getReviews, getMeta, updateHelpfulness, updateReported, postReviewsToDB } = require('../models/methods');

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
  // {
  //   product_id: 71697,
  //   rating: 4,
  //   summary: "It's nice ",
  //   body: "It's pretty nice i will recommend to other friends",
  //   recommend: true,
  //   name: 'jackie111',
  //   email: 'jackie111@mail.com',
  //   photos: [],
  //   characteristics: { '240582': 4, '240583': 4, '240584': 5, '240585': 3 }
  //   } { product_id, rating, summary, body, recommend, name, email, photos, characteristics }

  postReviews: (req, res) => {
    postReviewsToDB(req.body, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send(result);
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