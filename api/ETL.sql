-- Create tables for reviews, characteristics, characteristic_review and copy from local downloads
CREATE TABLE reviews_sample(
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  rating INTEGER,
  "date" BIGINT,
  summary TEXT,
  body TEXT,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name VARCHAR(100),
  reviewer_email VARCHAR(255),
  response TEXT,
  helpfulness INTEGER
);
COPY reviews_sample(id, product_id, rating, "date", summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness
)
FROM '/Users/cts1988/Downloads/reviews.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE characteristics_sample(
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  "name" VARCHAR(100)
);
COPY characteristics_sample(id, product_id, "name")
FROM '/Users/cts1988/Downloads/characteristics.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE characteristics_reviews_sample(
  id INTEGER PRIMARY KEY,
  characteristic_id INTEGER,
  review_id INTEGER,
  "value" INTEGER
);
COPY characteristics_reviews_sample(id, characteristic_id, review_id, "value")
FROM '/Users/cts1988/Downloads/characteristic_reviews.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE characteristics_reviews_combined(
  id INTEGER PRIMARY KEY,
  characteristic_id INTEGER,
  review_id INTEGER,
  "value" INTEGER,
  "name" VARCHAR(100)
);

CREATE TABLE product_all(
  id integer primary key,
  "name" varchar(255),
  slogan varchar(255),
  "description" text,
  category varchar(255),
  default_price integer
);

COPY product_all(id, "name", slogan, "description", category, default_price)
FROM '/Users/cts1988/Downloads/product.csv'
DELIMITER ','
CSV HEADER;



-- Fit into the three tables from the schema
INSERT INTO "user"(nickname, email)
SELECT reviewer_name, reviewer_email FROM reviews_sample;

INSERT INTO product(product_id)
SELECT DISTINCT product_id FROM reviews_sample;

-- Create photo table
COPY photo(id, review_id, "url")
FROM '/Users/cts1988/Downloads/reviews_photos.csv'
DELIMITER ','
CSV HEADER;

-- Create review table
INSERT INTO review(id, rating, summary, recommend, body, "date", reviewer_name, reported, helpfulness)
SELECT id, rating, summary, recommend, body, to_timestamp("date" / 1000), reviewer_name, reported, helpfulness FROM reviews_sample;



ALTER TABLE characteristics_reviews_sample ADD column "name" VARCHAR(100);

INSERT INTO characteristics_reviews_combined
SELECT characteristics_reviews_sample.id, characteristic_id, review_id, "value", "name" FROM characteristics_reviews_sample
INNER JOIN characteristics_sample ON characteristics_reviews_sample.characteristic_id = characteristics_sample.id;

-- somehow the response, product_id is not copied from reviews_sample, so redo that here
UPDATE review
SET response = reviews_sample.response
FROM reviews_sample
WHERE review.id = reviews_sample.id;

UPDATE review
SET product_id = reviews_sample.product_id
FROM reviews_sample
WHERE review.id = reviews_sample.id;

UPDATE review
SET fit = characteristics_reviews_combined.value
FROM characteristics_reviews_combined
WHERE characteristics_reviews_combined.review_id = review.id AND characteristics_reviews_combined."name" = 'Fit';

UPDATE review
SET "length" = characteristics_reviews_combined.value
FROM characteristics_reviews_combined
WHERE characteristics_reviews_combined.review_id = review.id AND characteristics_reviews_combined."name" = 'Length';

UPDATE review
SET "size" = characteristics_reviews_combined.value
FROM characteristics_reviews_combined
WHERE characteristics_reviews_combined.review_id = review.id AND characteristics_reviews_combined."name" = 'Size';

UPDATE review
SET width = characteristics_reviews_combined.value
FROM characteristics_reviews_combined
WHERE characteristics_reviews_combined.review_id = review.id AND characteristics_reviews_combined."name" = 'Width';

UPDATE review
SET comfort = characteristics_reviews_combined.value
FROM characteristics_reviews_combined
WHERE characteristics_reviews_combined.review_id = review.id AND characteristics_reviews_combined."name" = 'Comfort';

UPDATE review
SET quality = characteristics_reviews_combined.value
FROM characteristics_reviews_combined
WHERE characteristics_reviews_combined.review_id = review.id AND characteristics_reviews_combined."name" = 'Quality';

-- let product has an array of review_ids
UPDATE product
SET review_ids = c.arr
FROM (
  SELECT product_id, array_agg(id) AS arr
  FROM review
  GROUP BY product_id
) c
WHERE product.id = c.product_id;


-- show all products including the ones with no reviews
INSERT INTO all_product(id) SELECT id FROM product_all;
UPDATE all_product SET review_ids = product.review_ids FROM product WHERE product.id = all_product.id;

-- let product has an array of characteristics
UPDATE all_product
SET characteristics = c.obj
FROM (
  SELECT product_id, json_object_agg(id, "name") AS obj
  FROM characteristics_sample
  GROUP BY product_id
) c
WHERE all_product.id = c.product_id;

-- restart serial id
ALTER SEQUENCE <table name>_id_seq RESTART;

-- get reviews
--aggregate review results in json form
WITH
photo AS (
  SELECT id, review_id, "url"
  FROM photo
),
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
WHERE review_id = 1000000;

-- improve performance
-- first search the review ids that the product has, then for each review id, do the search query
WITH
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
WHERE review_id = 2;

-- do the same to photo table
INSERT INTO review_photos(id) SELECT id FROM review;

UPDATE review_photos
SET photos = c.arr
FROM (
  SELECT review_id, array_agg(json_build_object('id', photo.id, 'url', photo.url)) AS arr
  FROM photo
  GROUP BY review_id
) c
WHERE review_photos.id = c.review_id;

UPDATE product
SET review_ids = c.arr
FROM (
  SELECT product_id, array_agg(id) AS arr
  FROM review
  GROUP BY product_id
) c
WHERE product.id = c.product_id;

--get meta reviews
WITH
review_meta AS (
  SELECT product_id, json_object_agg(rating, cnt) as ratings, json_object_agg(recommend, cnt2) as recommended
  FROM (
    SELECT product_id, rating, count(*) as cnt, recommend, count(*) as cnt2
    FROM review WHERE product_id = 2
    GROUP BY product_id, rating, recommend
  ) t
  GROUP BY t.product_id
)
SELECT json_build_object('product_id', product_id, 'ratings', (select ratings from review_meta), 'recommended', (select recommended from review_meta))
FROM review_meta;







--improve meta reviews query
--first, get a flattened product-review_id table, then use it to join the review table to get the data
WITH
review_target AS (
  SELECT *
  FROM (
    SELECT review.id, rating, recommend, size, width, fit, "length", comfort, quality, product_id
    FROM review
    INNER JOIN (
      SELECT id, unnest(review_ids) AS review_id
      FROM product
      WHERE id = 12
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
GROUP BY meta_ra.product_id;


-- , width, avg(width) AS avgw, fit, avg(fit) AS avgf, "length", avg("length") AS avgl, comfort, avg(comfort) AS avgc, quality, avg(quality) AS avgq
-- , width, fit, "length", comfort, quality

-- post a new review (how to insert one review id into product table review_ids array)
-- https://bipp.io/sql-tutorial/postgresql/insert-data-into-an-array/

UPDATE <table name> SET <column name> = array.append(<column name>, append item) WHERE <condition>;


DO $$
    DECLARE current_review_id INTEGER;
            photo_arr VARCHAR[] = array['http1', 'http2'];
            p VARCHAR;
            photoid INTEGER;
    BEGIN
      SELECT MAX(id) INTO current_review_id FROM review;
      INSERT INTO review(id, product_id, rating, summary, body, recommend, reviewer_name, email) VALUES (current_review_id + 1, 5, 4, 'this is a test summary', 'this is a test bory', 'true', 'haha123', 'haha123@mail.com');
      INSERT INTO review_photos(id) VALUES (current_review_id + 1);
      UPDATE all_product SET review_ids = array_append(review_ids, current_review_id) WHERE id = 5;
      FOREACH p IN ARRAY photo_arr
      LOOP
        SELECT MAX(id) INTO photoid FROM photo;
        INSERT INTO photo(id, review_id, "url") VALUES (photoid + 1, current_review_id + 1, p);
        UPDATE review_photos SET photos = array_append(photos, ('{"id": "'|| photoid + 1 || '", "url": "' || p || '"}')::json) WHERE id = current_review_id + 1;
      END LOOP;
END $$;

DO $$
    DECLARE current_review_id INTEGER;
            photo_arr VARCHAR[] = array['http1', 'http2'];
            p VARCHAR;
            photoid INTEGER;
    BEGIN
      SELECT MAX(id) INTO current_review_id FROM review;
      FOREACH p IN ARRAY photo_arr
      LOOP
        SELECT MAX(id) INTO photoid FROM photo;
        INSERT INTO photo(id, review_id, "url") VALUES (photoid + 1, current_review_id + 1, p);
        UPDATE review_photos SET photos = array_append(photos, ('{"id": "'|| photoid + 1 || '", "url": "' || p || '"}')::json) WHERE review_photos.id = current_review_id;
      END LOOP;
END $$;