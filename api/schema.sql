-- user table is no use
CREATE TABLE "user"(
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(100),
  email VARCHAR(255)
);

CREATE TABLE product(
  id INTEGER PRIMARY KEY,
  review_ids INTEGER[],
);

-- schema No.1
CREATE TABLE all_product(
  id INTEGER PRIMARY KEY,
  review_ids INTEGER[],
  characteristics json
);

-- schema No.2
CREATE TABLE review_photos(
  id INTEGER PRIMARY KEY,
  photos json[]
);

-- schema No.3
CREATE TABLE photo(
  id SERIAL PRIMARY KEY,
  review_id INTEGER,
  "url" VARCHAR(255)
);

-- schema No.4
CREATE TABLE review(
  id INTEGER PRIMARY KEY,
  rating INTEGER CONSTRAINT rating_value CHECK(rating = NULL OR (rating > 0 AND rating < 6)),
  summary TEXT,
  recommend VARCHAR(100),
  body TEXT,
  size INTEGER CONSTRAINT size_value CHECK(size = NULL OR (size > 0 AND size < 6)),
  width INTEGER CONSTRAINT width_value CHECK(width = NULL OR (width > 0 AND width < 6)),
  fit INTEGER CONSTRAINT fit_value CHECK(fit = NULL OR (fit > 0 AND fit < 6)),
  "length" INTEGER CONSTRAINT length_value CHECK("length" = NULL OR ("length" > 0 AND "length" < 6)),
  comfort INTEGER CONSTRAINT comfort_value CHECK(comfort = NULL OR (comfort > 0 AND comfort < 6)),
  quality INTEGER CONSTRAINT quality_value CHECK(quality = NULL OR (quality > 0 AND quality < 6)),
  "date" TIMESTAMP,
  reported VARCHAR(100),
  helpfulness INTEGER,
  user_id INTEGER,
  CONSTRAINT fk_user
      FOREIGN KEY(user_id)
          REFERENCES "user"(id),
  reviewer_name VARCHAR(100),
  email VARCHAR(255),
  product_id INTEGER,
  -- CONSTRAINT fk_product
  --     FOREIGN KEY(product_id)
  --         REFERENCES "product"(id)
  );

