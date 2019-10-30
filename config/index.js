module.exports = {
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  databaseName: "izzyandwill",
  adminKey: process.env.ADMIN_KEY || "test"
};
