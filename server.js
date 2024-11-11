const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

const db = require('./database');
const routes = require('./routes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/', routes);

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});