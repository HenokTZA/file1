const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');

// Convert UUID to a Buffer and then to ObjectId
const convertUuidToObjectId = (uuid) => {
    const buffer = Buffer.from(uuid.replace(/-/g, '').slice(0, 24), 'hex');  // Truncate UUID to 12 bytes
    return new ObjectId(buffer);  // Return the converted ObjectId
};
module.exports =convertUuidToObjectId;