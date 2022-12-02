const {Client} = require('pg');
const client = new Client({
  host: 'localhost',
  user: 'cts1988',
  port: 5432,
  password: '',
  database: 'cts1988'
});

module.exports = client;
