var express = require('express');
var router = express.Router();

var request = require('request-promise');
var key = process.env.KEY;
var sheetId = process.env.SHEET_ID;
console.info(sheetId, key)
var GoogleSpreadsheet = require('google-spreadsheet');
const util = require('util');
const promisify = util.promisify;
const creds = require('./../client_secret.json');

/* GET users listing. */
router.get('/', function (req, res) {

  // Identifying which document we'll be accessing/reading from
  var doc = new GoogleSpreadsheet(sheetId);

  results = [];
  promisify(doc.useServiceAccountAuth)(creds)
    .then(() => promisify(doc.getCells)(1))
    .then(cells => cells.forEach(({row, col, _value}) => {
      if (row === 1) return;
      switch (col) {
        // room
        case 1:
          results[row] = Object.assign(results[row] || {}, {room: _value})
          break;
        // price
        case 2:
          results[row] = Object.assign(results[row] || {}, {price: _value})
          break;
        // allocated
        case 3:
          results[row] = Object.assign(results[row] || {}, {allocated: _value})
          break;
      }
    }))
    .then(() => res.send(results.filter(r => !!r)));
});

module.exports = router;
