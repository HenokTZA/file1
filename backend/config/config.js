// config.js
require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI || "mongodb://mongo:27017/ManagementTool2",
  baseDBName: process.env.BASE_DB_NAME || "ManagementTool2",
   // Connection settings
   maxTenantConnections: parseInt(process.env.MAX_TENANT_CONNECTIONS) || 5,
   connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT) || 30000,
   
   // Security
   retryWrites: process.env.RETRY_WRITES !== 'false',
   writeConcern: process.env.WRITE_CONCERN || 'majority',
  port: process.env.PORT || 5000,
  corsOrigin: process.env.CORS_ORIGIN ,
};