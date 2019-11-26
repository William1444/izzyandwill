function loadDefaultSendGridKeyFromFile() {
  return require('./../client_secret.json').sendgridApiKey;
};

module.exports = {
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/izzyandwill',
  sendgridApiKey: process.env.SENDGRID_API_KEY || loadDefaultSendGridKeyFromFile(),
  fromEmail: process.env.FROM_EMAIL || 'example.email@gmail.com',
  fromTel: process.env.FROM_TEL || '07123123123',
  siteUrl: 'https://www.izzyandwill.co.uk',
  userPassword: process.env.USER_PASSWORD || 'password',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  sortCode: process.env.SORT_CODE || '00-00-00',
  accountNumber: process.env.ACCOUNT_NUMBER || '12341234',
  mapsApiKey: process.env.MAPS_API_KEY || 'NOT_SET',
  isTest: process.env.NODE_ENV === 'test'
};
