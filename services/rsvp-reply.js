const {fromEmail, fromTel, sendgridApiKey, siteUrl, sortCode, accountNumber} = require('./../config');
const sg = require('sendgrid')(sendgridApiKey);
const emailerTemplate = require('./emailer-template');

const email = ({to, firstName, lastName, attending, otherGuests, room}) => {
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [
        {
          to: [
            {
              email: to
            }
          ],
          subject: 'We are so excited you will be celebrating with us at Orchardleigh on 6th June 2020!'
        }
      ],
      from: {
        email: fromEmail
      },
      content: [
        {
          type: 'text/html',
          value: html({firstName, lastName, attending, otherGuests, room})
        }
      ]
    }
  });
  return sg.API(request);
};

function reverseCamelCase(val) {
  return val.toLowerCase().trim().split(" ")
    .map(name => name.charAt(0).toUpperCase() + name.slice(1))
    .join(" ");
}

function getFullNameList(attendees) {
  let firstNames = attendees.map(a => reverseCamelCase(a.firstName));
  return firstNames
    .join(", ")
    .replace(/,(?!.*,)/, ' &');
}

const html = ({invitees, attendees, absentees, room}) => {
  const roomSummary = room && room.room || 'NA';
  const helloMsg = `
<p>Hi ${getFullNameList(invitees)}</p>`
  const anyChanges = `
<p>If you made a mistake in your RSVP, or need to make changes then please reply to this email, alternatively
call Izzy on <a href="tel:${fromTel}"></a>${fromTel}</p>`;

  if (!attendees || attendees.length === 0) {
    let cannotAttendMsg = '<p>We are sorry to hear that you cannot attend.</p>';
    return emailerTemplate(helloMsg + cannotAttendMsg + anyChanges)
  }
  const attendingMsg = `
<p>We are so pleased that ${getFullNameList(attendees)} will be joining us at <b>Orchardleigh</b> on <b>Saturday 6 June 2020</b> to celebrate our marriage!</p>`;

  const absenteeMsg = absentees && absentees.length > 0 && `<p>Please do let us know if ${getFullNameList(absentees)} will be able to make it!</p>`;

  const roominfoMsg = roomSummary !== 'NA' && `
<p>You've decided to stay with us at Orchardleigh in <b>${room.room}</p>
<p>The price for the room is <b>£${room.price}</b></p>
<p>To secure the room, please transfer £${room.price} to the following account:</p>
<p style="padding-left=20px">Sort Code: ${sortCode}</p>
<p style="padding-left=20px">Account Number: ${accountNumber}</p>
<p style="padding-left=20px">Reference: OL ${room.room}</p>` || '';

  const attendeesRsvpDetails = attendees.map(a => `
  <tr>
    <td>${reverseCamelCase(a.firstName)} meal choice:</td>
    <td style="font-weight: normal">${a.foodChoice}</td>
  </tr>
`).join('');
  const rsvpDetails = `
<p>Below are your RSVP details</p>
<table width="100%" style="padding-bottom: 10px;">
  <tr>
    <td>Room:</td>
    <td style="font-weight: normal">${roomSummary}</td>
  </tr>
  ${attendeesRsvpDetails}
</table>`;

  const finalThoughts = `
<p>The venue's address is: Orchardleigh House, Orchardleigh Park, Frome BA11 2PB</p>
<p>Please refer to <a href="${siteUrl}/travel">our wedding website</a> for detailed directions on the day.</p>`

  return emailerTemplate(helloMsg + attendingMsg + absenteeMsg + roominfoMsg + rsvpDetails + anyChanges + finalThoughts);
};

module.exports = {
  email,
  html
};
