const AWS = require('aws-sdk');
const {awsSesConfig, fromEmail} = require('./../config');

if (awsSesConfig) {
  console.info('using provided aws credentials');
  AWS.config.update(awsSesConfig);
} else {
  console.info('defaulting to iam credentials');
}

const ses = new AWS.SES({apiVersion: '2010-12-01'});

const email = ({to, subject, htmlContent, content}) => {
  const params = {
    Destination: {
      ToAddresses: [to]
    },
    ConfigurationSetName: 'izzy-and-will-email',
    Message: {
      Body: {
        Html: {
          // HTML Format of the email
          Charset: 'UTF-8',
          Data: htmlContent
        },
        Text: {
          Charset: 'UTF-8',
          Data: content
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromEmail
  };
  return ses.sendEmail(params).promise()
    .then(data => console.info(`email submitted to ses: ${JSON.stringify(data)}`))
    .catch(e => console.error(e));
};

module.exports = {
  email
};
