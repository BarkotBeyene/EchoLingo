const admin = require("firebase-admin");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require("../config/firebaseConfig.json"); // Ensure this file exists!

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "echolingo-b8e02.appspot.com", // Corrected Firebase bucket name
});

const bucket = admin.storage().bucket();
module.exports = { admin, bucket };