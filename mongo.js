const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

module.exports = async () => {
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    return mongoose;
};