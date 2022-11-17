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