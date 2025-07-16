const crypto = require('crypto');

function generateConfirmationCode() {
  return crypto.randomBytes(4).toString('hex'); 
}

module.exports = { generateConfirmationCode };