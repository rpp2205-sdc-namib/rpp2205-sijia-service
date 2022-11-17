CREATE TABLE "user"(
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(100),
  email VARCHAR(255)
);

CREATE TABLE product(
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL
);


CREATE TABLE review(
  id SERIAL PRIMARY KEY,
  rating INTEGER CONSTRAINT rating_value CHECK(rating = NULL OR (rating > 0 AND rating < 6)),
  recommended BOOLEAN,
  fit INTEGER CONSTRAINT fit_value CHECK(fit = NULL OR (fit > 0 AND fit < 6)),
  "length" INTEGER CONSTRAINT length_value CHECK("length" = NULL OR ("length" > 0 AND "length" < 6)),
  comfort INTEGER CONSTRAINT comfort_value CHECK(comfort = NULL OR (comfort > 0 AND comfort < 6)),
  quality INTEGER CONSTRAINT quality_value CHECK(quality = NULL OR (quality > 0 AND quality < 6)),
  headline TEXT,
  written_review TEXT,
  created_at TIMESTAMP,
  reported BOOLEAN,
  helpfulness INTEGER,
  userid INTEGER,
  CONSTRAINT fk_user
      FOREIGN KEY(userid)
          REFERENCES "user"(id),
  productid INTEGER,
  CONSTRAINT fk_productid
      FOREIGN KEY(productid)
          REFERENCES "product"(id));