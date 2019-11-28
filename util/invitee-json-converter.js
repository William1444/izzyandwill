const util = require('util');
const fs = require('fs');
const path = require('path');
const csvParse = require("csv-parse");

function mapInvitee({fullName, firstName1, firstName2, firstName3, lastName1, lastName2, lastName3}) {
  return {
    fullName,
    match: {
      firstName: [firstName1, firstName2, firstName3].filter(f => !!f),
      lastName: [lastName1, lastName2, lastName3].filter(f => !!f),
    }
  };
}

util.promisify(fs.readFile)(path.join(__dirname, '../db/invites.csv'))
  .then(csv => util.promisify(csvParse)(csv, {columns: true}))
  .then(inviteesCsvObj =>
    inviteesCsvObj
      .reduce((accum, invitee) => {
        accum[invitee.group] = accum[invitee.group] || {invitees: []};
        accum[invitee.group].invitees.push(mapInvitee(invitee))
        return accum
      }, [])
      .filter(i => !!i))
  .then(invitees => util.promisify(fs.writeFile)(path.join(__dirname, '../db/invitees-res.json'), JSON.stringify(invitees)))
  .then(() => {
    console.info('success');
    process.exit(0);
  })
  .catch(e => {
    console.error(e.message);
    process.exit(1);
  });

csvParse();
