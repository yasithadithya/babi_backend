const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These options are no longer needed in Mongoose 6+, but included for compatibility
        });

        console.log(`\n💖 MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
        console.error('Make sure your MongoDB Atlas connection string is correct in .env file');
        process.exit(1);
    }
};

module.exports = connectDB;
