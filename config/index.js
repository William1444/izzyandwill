const defaultSecrets = require('./../client_secret.json');

module.exports = {
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  databaseName: "izzyandwill",
  adminKey: process.env.ADMIN_KEY || "test",
  sendgridApiKey: process.env.SENDGRID_API_KEY || defaultSecrets.sendgridApiKey,
  fromEmail: process.env.FROM_EMAIL || 'orchardleigh.willandizzy@gmail.com',
  siteUrl: 'https://izzyandwill.herokuapp.com',
  userPassword: process.env.USER_PASSWORD || 'password',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  sortCode: process.env.SORT_CODE || '00-00-00',
  accountNumber: process.env.ACCOUNT_NUMBER || '12341234'
};
