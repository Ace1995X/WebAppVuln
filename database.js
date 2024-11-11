const Database = require('better-sqlite3');
const db = new Database(':memory:');

db.exec("CREATE TABLE users (id INT, name TEXT, password TEXT)");
db.exec("INSERT INTO users (id, name, password) VALUES (1, 'administrator', 'adminlozinka')");
db.exec("CREATE TABLE credit_cards (ccID INTEGER PRIMARY KEY, cardNum TEXT, cardHolder TEXT, exp TEXT, cvv TEXT)");

module.exports = db;