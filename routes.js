const express = require('express');
const router = express.Router();
const db = require('./database');
const path = require('path');

let sqlInjectionEnabled = true;
let insecureStorageEnabled = true;

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (sqlInjectionEnabled) {
    const row = db.prepare(`SELECT * FROM users WHERE name = '${username}' AND password = '${password}'`).get();
    if (row) {
      res.send(`Dobrodošli - ${row.name}`);
    } else {
      res.send('Netočni podatci');
    }
  } else {
    const row = db.prepare(`SELECT * FROM users WHERE name = ? AND password = ?`).get(username, password);
    if (row) {
      res.send(`Welcome ${row.name}`);
    } else {
      res.send('Netočni podatci');
    }
  }
});

router.post('/store-credit-card', (req, res) => {
  const { cardNum, cardHolder, exp, cvv } = req.body;
  if (insecureStorageEnabled) {
    db.prepare(`INSERT INTO credit_cards (cardNum, cardHolder, exp, cvv) VALUES (?, ?, ?, ?)`).run(cardNum, cardHolder, exp, cvv);
    res.send('Podatci pohranjeni nesigurno');
  } else {
    const encryptedCardNum = Buffer.from(cardNum).toString('base64');
    const encryptedCardHolder = Buffer.from(cardHolder).toString('base64');
    const encryptedCvv = Buffer.from(cvv).toString('base64');
    db.prepare(`INSERT INTO credit_cards (cardNum, cardHolder, exp, cvv) VALUES (?, ?, ?, ?)`).run(encryptedCardNum, encryptedCardHolder, exp, encryptedCvv);
    res.send('Podataci pohranjeni sigurno');
  }
});

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

router.post('/toggle-sql-injection', (req, res) => {
  sqlInjectionEnabled = !sqlInjectionEnabled;
  res.send(`SQL umetanje je ${sqlInjectionEnabled ? 'omogućeno' : 'onemogućeno'}`);
});

router.post('/toggle-insecure-storage', (req, res) => {
  insecureStorageEnabled = !insecureStorageEnabled;
  res.send(`Nesigurna pohrana je ${insecureStorageEnabled ? 'omogućena' : 'onemogućena'}`);
});

router.get('/status', (req, res) => {
  res.json({
    sqlInjectionEnabled,
    insecureStorageEnabled
  });
});

router.get('/data', (req, res) => {
  const users = db.prepare(`SELECT * FROM users`).all();
  const creditCards = db.prepare(`SELECT * FROM credit_cards`).all();
  let html = '<h1>Pohranjeni podatci</h1>';
  html += '<h2>Korisnici</h2><ul>';
  users.forEach(user => {
    html += `<li>ID: ${user.id}, Name: ${user.name}, Password: ${user.password}</li>`;
  });
  html += '</ul>';
  html += '<h2>Kreditne kartice</h2><ul>';
  creditCards.forEach(card => {
    html += `<li>ID: ${card.ccID}, Broj kartice: ${card.cardNum}, vlasnik kartice: ${card.cardHolder}, Datum isteka: ${card.exp}, CVV: ${card.cvv}</li>`;
  });
  html += '</ul>';
  res.send(html);
});

module.exports = router;