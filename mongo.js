const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://dbUser:kxgH7x87PaNVl2Tl@cluster0.99lyy.mongodb.net/kaibotdb?retryWrites=true&w=majority';

module.exports = async () => {
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    return mongoose;
};