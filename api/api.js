const express = require('express');
const app = express();
const client = require('./db/index.js');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT_API;
const bodyparser = require('body-parser');
const requestHandlers = require('./controllers/requestHandlers.js');

app.use(bodyparser.json());

app.get('/reviews', requestHandlers.getAllReviews);

app.get('/reviews/meta', requestHandlers.getMetaReviews);

app.post('/reviews', requestHandlers.postReviews);

app.put('/reviews/:review_id/helpful', requestHandlers.putHelpfulness);

app.put('/reviews/:review_id/report', requestHandlers.putReported);

app.listen(port, () => {
  console.log('Listening on port ' + port + '...');
});

client.connect(() => {
  console.log('Connected to Postgres.');
});
