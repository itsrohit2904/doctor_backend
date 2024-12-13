const mongoose = require('mongoose');

const connectDB = async () => {

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("Database Connected"); 
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1); // Exit the process with an error code
    }
}

module.exports = connectDB;

// Do not use '@' symbol in your databse user's password else it will show an error.