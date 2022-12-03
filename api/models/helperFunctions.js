module.exports = {
  getReviewIdsQuery: (product_id) => {
    return `SELECT review_ids
            FROM product
            WHERE id = ${product_id}`
  },

  getReviewsQuery: (review_id) => {
    return `WITH
    review AS (
      SELECT r.id AS review_id, r.rating, r.summary, r.recommend, r.response, r.body, r."date", r.reviewer_name, r.helpfulness,
            json_agg(json_build_object('id', p.id, 'url', p."url")) AS photos
      FROM review r
      LEFT JOIN photo p
      on r.id = p.review_id
      GROUP BY r.id
    )
    SELECT json_agg(review)
    FROM review
    WHERE review_id = ${review_id};`
  },

  getMetaQuery: (product_id) => {
    return `
    WITH
    review_target AS (
      SELECT *
      FROM (
        SELECT review.id, rating, recommend, size, width, fit, "length", comfort, quality, product_id
        FROM review
        INNER JOIN (
          SELECT id, unnest(review_ids) AS review_id
          FROM product
          WHERE id = ${product_id}
        ) f ON review.id = f.review_id
        GROUP BY review.id
      ) d
    ),
    meta_ra AS (
      SELECT product_id, json_object_agg(rating, cnt) as ratings
      FROM (
        SELECT product_id, rating, count(rating) AS cnt
        FROM review_target
        GROUP BY product_id, rating
      ) ra
      GROUP BY ra.product_id
    ),
    meta_re AS (
      SELECT product_id, json_object_agg(recommend, cnt2) as recommended
      FROM (
        SELECT product_id, recommend, count(recommend) AS cnt2
        FROM review_target
        GROUP BY product_id, recommend
      ) re
      GROUP BY product_id
    ),
    meta_ch AS (
      SELECT json_build_object('value', size) AS size, json_build_object('value', width) AS width, json_build_object('value', fit) AS fit, json_build_object('value', "length") AS "length", json_build_object('value', comfort) AS comfort, json_build_object('value', quality) AS quality
      FROM (
        SELECT avg(size) AS size, avg(width) AS width, avg(fit) AS fit, avg("length") AS "length", avg(comfort) AS comfort, avg(quality) AS quality
        FROM review_target
      ) rt
    )
    SELECT json_build_object('product_id', meta_ra.product_id, 'ratings', (select ratings from meta_ra), 'recommended', (select recommended from meta_re), 'characteristics', json_agg(meta_ch)->0)
    FROM meta_ra, meta_re, meta_ch
    GROUP BY meta_ra.product_id;`
  },

  postReviewQuery: (obj) => {

  },

  putQuery: (review_id, field) => {
    if (field === 'helpful') {
      return `UPDATE review SET helpfulness = helpfulness + 1 WHERE id = ${review_id}`;
    } else if (field === 'reported') {
      return `UPDATE review SET reported = 'true' WHERE id = ${review_id}`;
    }
  },

  handleCountAndSort: (arr, count, sort) => {
    var sortby;
    if (sort === 'newest') {
      sortby = "date"
    } else if (sort === 'helpful') {
      sortby = "helpfulness"
    } else {
      sortby = "id"
    };
    arr.sort((a, b) => {
      return (b[sortby] - a[sortby])
    })
    return arr.slice(0, count);
  }
}