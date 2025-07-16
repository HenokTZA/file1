
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const config = require("./config/config");
const routes = require("./Routes/index");
const { connectRedis } = require("./redisClient");
const { 
  getOrganizationDB, 
  closeAllConnections,
  getActiveTenantCount,
} = require("./config/dbManager");

dotenv.config();

const app = express();
const httpServer = http.createServer(app); // ✅ single server used for everything

const { initSocket } = require("./socket/index"); // Import the initSocket function
const io = initSocket(httpServer); // ✅ Handles both Flask and user sockets


function initializeMainModels(mainConnection) {
  return {
    Organization: require('./Models/OrganizationSchema')(mainConnection),
    Superadmin: require('./Models/SuperAdminSchema')(mainConnection),
    TenantUser: require('./Models/TenantUserSchema')(mainConnection)
  };
}
// Middleware to attach DB connections to requests
app.use(async (req, res, next) => {
  try {
    // Main DB models are always available
    req.mainModels = {
      Organization: mongoose.model('Organization'),
      Superadmin: mongoose.model('Superadmin'),
      TenantUser: mongoose.model('TenantUser')
    };
    
    // Tenant DB injection if tenantId is present
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId;
    if (tenantId) {
      const tenantConn = await getOrganizationDB(tenantId);
      req.tenantConnection = tenantConn; // Optional: keep for debugging/advanced usage
      req.tenantDB = tenantConn.connection;
      req.tenantModels = {
        User: tenantConn.models.get('User'),
        Team: tenantConn.models.get('Team'),
        Task: tenantConn.models.get('Task'),
        Resource: tenantConn.models.get('Resource'),
        ResourceType: tenantConn.models.get('ResourceType'),
        Notification: tenantConn.models.get('Notification'),
        ResourceBooking: tenantConn.models.get('ResourceBooking'),
      };
    }

    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    next(error);
  }
});

// Main app initialization
async function initializeApplication() {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      socketTimeoutMS: 30000
    });

    await connectRedis();

    const { Organization, Superadmin, TenantUser } = initializeMainModels(mongoose.connection);

    // Middleware setup
    app.use(bodyParser.json());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({ origin: config.corsOrigin, credentials: true }));
    app.use(cookieParser());

    // Routes
    app.use("/api", routes);

    // 404 handler
    app.use("*", (req, res) => res.status(404).send("Not Found"));

    // Start HTTP + Socket.IO server
    httpServer.listen(config.port,'0.0.0.0',() => {
      console.log(`
        ✅ Server running on port ${config.port}
        🏢 Active tenants: ${getActiveTenantCount()}
        🌐 Main DB URI: ${config.mongoURI}
        🔌 Socket.IO listening at http://localhost:${config.port}
      `);
    });

  } catch (error) {
    console.error("❌ Initialization failed:", error);

    if (mongoose.connection.readyState === 1) {
      app.use((req, res, next) => {
        req.mainModels = { Organization: mongoose.model("Organization") };
        next();
      });
      console.log("⚠️ Running in fallback mode; WebSocket and tenants disabled.");

    } else {
      console.error("🚨 CRITICAL: No database connection. Exiting...");
      process.exit(1);
    }
  }
}

async function shutdown() {
  console.log('Shutting down gracefully...');
  await closeAllConnections();

  mongoose.connection.close(false, () => {
    console.log('Main DB closed');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

// ✅ Support for Nodemon Hot Reload
process.once('SIGUSR2', async () => {
  console.log('SIGUSR2 received — preparing for restart...');
  await shutdown();
  process.kill(process.pid, 'SIGUSR2');
});

process.on('unhandledRejection', err => {
  console.error('Unhandled rejection:', err);
});
process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
  shutdown();
});
initializeApplication();