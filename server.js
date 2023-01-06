require('newrelic');
const express = require('express');
const app = express();
const client = require('./db/index.js');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT_API || 3300;
const bodyparser = require('body-parser');
const requestHandlers = require('./controllers/requestHandlers.js');
// var cache = require('./cache-middleware');
// var cacheConfig = require('./cache.json');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

// app.use(cache(cacheConfig));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('hello there!');
})

app.get('/me', (req, res) => {
  res.send('hi again!')
})
app.get('/reviews', requestHandlers.getAllReviews);

app.get('/reviews/meta', requestHandlers.getMetaReviews);

app.post('/reviews', requestHandlers.postReviews);

app.put('/reviews/:review_id/helpful', requestHandlers.putHelpfulness);

app.put('/reviews/:review_id/report', requestHandlers.putReported);

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Listening on port ' + port + '...');
  }

});

client.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Connected to Postgres.');
  }

});
