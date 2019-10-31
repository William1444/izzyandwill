const defaultSecrets = require('./../client_secret.json');

module.exports = {
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  databaseName: "izzyandwill",
  adminKey: process.env.ADMIN_KEY || "test",
  sendgridApiKey: process.env.SENDGRID_API_KEY || defaultSecrets.sendgridApiKey,
  fromEmail: 'orchardleigh.willandizzy@gmail.com'
};
