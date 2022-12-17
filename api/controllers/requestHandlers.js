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
    var product_id = req.query?.product_id; //? - handle query undefined situation in getMeta instead
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
  //   rating: 2,
  //   summary: 'Not so good',
  //   body: 'Not very satisfying',
  //   recommend: true,
  //   name: 'yiyi1234',
  //   email: 'yiyi1234@mail.com',
  //   photos: [
  //   'http://res.cloudinary.com/dwcubhwiw/image/upload/v1670457820/jxhq1iafvg8czy2dqo2v.jpg'
  //   ],
  //   characteristics: { '240582': 2, '240583': 1, '240584': 1, '240585': 3 }
  //   }

  postReviews: (req, res) => {
    console.log(req.body, req.body.characteristics, typeof req.body.characteristics)
    postReviewsToDB(req.body, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send("post successful!");
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