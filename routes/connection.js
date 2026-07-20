const mongoose = require('mongoose');

async function connectToMongoDB(url) {
    try {
        await mongoose.connect(url);
        console.log("⚡ Connected to MongoDB successfully!");
        return true;
    } catch (err) {
        console.warn("⚠️ Could not connect to MongoDB:", err.message);
        console.warn("Ensure MongoDB is running locally at mongodb://127.0.0.1:27017/url");
        return false;
    }
}

module.exports = {
    connectToMongoDB,
};