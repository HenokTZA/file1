
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { handleAdminRegistration } = require("../Services/adminRegistration");
const connectedUsers = {};
let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  const internalNamespace = io.of("/internal");

  internalNamespace.use((socket, next) => {
    const internalSecret = process.env.INTERNAL_SOCKET_SECRET;
    const clientSecret = socket.handshake.auth.secret;

    // Rely ONLY on the shared secret. This is secure and network-independent.
    if (internalSecret && clientSecret === internalSecret) {
        console.log(`[Internal] ✅ Auth successful for service: ${socket.id}`);
        return next();
    }

    // If the secret is missing or incorrect, reject the connection.
    const remoteIp = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress || '';
    console.error(`[Internal] ❌ FORBIDDEN: Connection attempt from ${remoteIp} with invalid secret.`);
    next(new Error("Forbidden: Invalid credentials for internal namespace"));
  });
  
  // This part remains the same
  internalNamespace.on("connection", (socket) => {
    console.log("🔌 Flask/Internal service connected to /internal namespace:", socket.id);

    socket.on("subscriber_created", async (data) => {
      try {
        const result = await handleAdminRegistration(data);
        console.log(`[Internal] ✅ Processed 'subscriber_created' for ${data.email}`);
        socket.emit("ack", { status: "success", data: result });
      } catch (err) {
        console.error("[Internal] ❌ Error processing 'subscriber_created':", err.message);
        socket.emit("ack", { status: "error", message: err.message });
      }
    });

    socket.on("disconnect", (reason) => {
        console.warn(`🔌 Internal service disconnected: ${socket.id}, Reason: ${reason}`);
    });
  });

  const userNamespace = io.of("/"); // Or just `io`

  userNamespace.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error("Authentication error: Token required"));
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_TOKEN_KEY);
      const orgId = decoded.tenantId || decoded.organization;
  
      socket.user = decoded;
      socket.orgId = orgId;
  
      next(); // Pass control to the connection handler
    } catch (err) {
      console.log("Authentication error:", err.message);
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });
  
  userNamespace.on("connection", (socket) => {
    console.log(`✅ User socket connected: ${socket.id} (User: ${socket.user._id})`);
    
    // Add user to relevant rooms
    socket.join(`org:${socket.orgId}`);
    socket.join(`org:${socket.orgId}:role:${socket.user.role}`);
    connectedUsers[socket.user._id.toString()] = socket.id;

    socket.on("disconnect", () => {
      const userId = socket.user?._id?.toString();
      if (userId) {
          delete connectedUsers[userId];
      }
      console.warn(`🔌 User socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIoInstance() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

module.exports = { 
    initSocket, 
    getIoInstance, // Renamed for clarity
    connectedUsers 
};