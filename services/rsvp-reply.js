const {fromEmail, sendgridApiKey, siteUrl, sortCode, accountNumber} = require('./../config');
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

const html = ({firstName, lastName, attending, otherGuests, room}) => {
  const roomSummary = room && room.room || 'NA';
  const helloMsg = `
<p>Hi ${firstName}</p>`
  const anyChanges = `
<p>If you made a mistake in your RSVP, or need to make changes then please reply to this email, alternatively
call Izzy on <a href="tel:07736687708"></a>07736687708</p>`;

  if(!attending) {
    let cannotAttendMsg = '<p>We are sorry to hear that you cannot attend.</p>';
    return emailerTemplate(helloMsg + cannotAttendMsg + anyChanges)
  }
  const attendingMsg = `
<p>We are so pleased that you will be joining us at <b>Orchardleigh</b> on <b>Saturday 6 June 2020</b> to celebrate our marriage!</p>`;

  const roominfoMsg = roomSummary !== 'NA' && `
<p>You've decided to stay with us at Orchardleigh in <b>${room.room}</p>
<p>The price for the room is <b>£${room.price}</b></p>
<p>To secure the room, please transfer £${room.price} to the following account:</p>
<p style="padding-left=20px">Sort Code: ${sortCode}</p>
<p style="padding-left=20px">Account Number: ${accountNumber}</p>
<p style="padding-left=20px">Reference: ${room.room}</p>` || '';

  const rsvpDetails = `
<p>Below are your RSVP details</p>
<table width="100%" style="padding-bottom: 10px;">
<tr>
  <td>Name:</td>
  <td style="font-weight: normal">${firstName} ${lastName}</td>
</tr>
<tr>
  <td>Attending:</td>
  <td style="font-weight: normal">${attending ? 'Yes!' : 'No'}</td>
</tr>
<tr>
  <td>Is anyone on the invite not able to make it:</td>
  <td style="font-weight: normal">${otherGuests ? otherGuests : 'Nope!'}</td>
</tr>
<tr>
  <td>Room:</td>
  <td style="font-weight: normal">${roomSummary}</td>
</tr>
</table>`;

  const finalThoughts = `
<p>The venue's address is: Orchardleigh House, Orchardleigh Park, Frome BA11 2PB</p>
<p>Please refer to <a href="${siteUrl}/travel">our wedding website</a> for detailed directions on the day.</p>`

  return emailerTemplate(helloMsg + attendingMsg + roominfoMsg + rsvpDetails + anyChanges + finalThoughts);
};

module.exports = {
  email,
  html
};
