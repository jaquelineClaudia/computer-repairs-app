const { initializedApp } = require('firebese/app');
const { getStorage } = require('firebese/app');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE,
    appId: process.env.FIREBASE_API_ID,
};

const firebaseApp = initializedApp(firebaseConfig);
const storage = getStorage(firebaseApp);

module.exports = { storage };
