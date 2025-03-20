// Re-export everything from firebase-admin.js
const firebaseAdmin = require("./firebase-admin")

// Re-export all named exports
module.exports = {
  ...firebaseAdmin,
}

// Re-export default as adminApp for compatibility
module.exports.default = firebaseAdmin.adminApp

