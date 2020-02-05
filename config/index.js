let awsSesConfig;
if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) {
  awsSesConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: "eu-west-1"
  }
} else {

}

module.exports = {
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/izzyandwill',
  fromEmail: process.env.FROM_EMAIL || 'example.email@gmail.com',
  fromTel: process.env.FROM_TEL || '07123123123',
  siteUrl: 'www.izzyandwill.co.uk',
  userPassword: process.env.USER_PASSWORD || 'password',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  sortCode: process.env.SORT_CODE || '00-00-00',
  accountNumber: process.env.ACCOUNT_NUMBER || '12341234',
  mapsApiKey: process.env.MAPS_API_KEY || 'NOT_SET',
  isTest: process.env.NODE_ENV === 'test',
  apiKey: process.env.API_KEY || 'key',
  awsSesConfig
};
