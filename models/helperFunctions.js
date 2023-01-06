module.exports = {
  getReviewIdsQuery: (product_id) => {
    return `SELECT review_ids
            FROM all_product
            WHERE id = ${product_id}`
  },

  getReviewsQuery: (review_id) => {
    return `
    WITH
    review AS (
      SELECT r.id AS review_id, r.rating, r.summary, r.recommend, r.response, r.body, r."date", r.reviewer_name, r.helpfulness,
            p.photos
      FROM review r
      LEFT JOIN review_photos p
      on r.id = p.id
      GROUP BY r.id, p.id
    )
    SELECT json_agg(review)
    FROM review
    WHERE review_id = ${review_id};`
  },

  getCharacteristicsQuery: (product_id) => {
    return `
    SELECT characteristics
    FROM all_product
    WHERE id = ${product_id}`
  },

  getMetaQuery: (product_id) => {
    var q = `
    WITH
    review_target AS (
      SELECT *
      FROM (
        SELECT review.id, rating, recommend, size, width, fit, "length", comfort, quality, product_id
        FROM review
        INNER JOIN (
          SELECT id, unnest(review_ids) AS review_id
          FROM all_product
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
    return q;
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

  postReviewQuery: (obj, characteristics) => {
    //insert into schema review and schema photo
    var { product_id, rating, summary, body, recommend, name, email, photos } = obj;
    var characteristics_arr = Object.keys(characteristics);
    var q =
    `DO $$
    DECLARE current_review_id INTEGER;
            photo_arr VARCHAR[] = ARRAY['${photos}'];
            characteristics_arr VARCHAR[] = ARRAY['size', 'fit', 'length', 'comfort', 'quality', 'width'];
            characteristics_obj JSON;
            p VARCHAR;
            photoid INTEGER;
            cid VARCHAR;
    BEGIN
      SELECT MAX(id) INTO current_review_id FROM review;
      SELECT characteristics INTO characteristics_obj FROM all_product WHERE id = ${product_id};
      INSERT INTO review(id, product_id, rating, summary, body, recommend, reviewer_name, email) VALUES (current_review_id + 1, ${product_id}, ${rating}, '${summary}', '${body}', '${recommend}', '${name}', '${email}');
      FOREACH cid IN ARRAY characteristics_arr
        LOOP
        EXECUTE format('UPDATE review SET %I = $1 WHERE id = $2', cid) USING CAST('${JSON.stringify(characteristics)}'::json->>cid AS INTEGER), current_review_id + 1;
        END LOOP;
      INSERT INTO review_photos(id) VALUES (current_review_id + 1);
      UPDATE all_product SET review_ids = array_append(review_ids, current_review_id + 1) WHERE id = ${product_id};
      FOREACH p IN ARRAY photo_arr
        LOOP
          SELECT MAX(id) INTO photoid FROM photo;
          INSERT INTO photo(id, review_id, "url") VALUES (photoid + 1, current_review_id + 1, p);
          UPDATE review_photos SET photos = array_append(photos, ('{"id": "'|| photoid + 1 || '", "url": "' || p || '"}')::json) WHERE id = current_review_id + 1;
        END LOOP;
    END $$;`
    return q;
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