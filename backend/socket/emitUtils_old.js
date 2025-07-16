const { getSocket, connectedUsers } = require("./index");

function notifyUser(userId, event, data) {
  const socketId = connectedUsers[userId];
  console.log(`📤 Emittinger to ${userId} at socket ${socketId}, event: ${event}`);
 
  if (socketId) {
    getSocket().to(socketId).emit(event, data);
  }
}

function notifyOrg(orgId, event, data) {
  getSocket().to(`org:${orgId}`).emit(event, data);
}

function notifyRole(orgId, role, event, data) {
  getSocket().to(`org:${orgId}:role:${role}`).emit(event, data);
}

module.exports = { notifyUser, notifyOrg, notifyRole };
