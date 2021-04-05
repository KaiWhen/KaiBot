const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://dbUser:a3PBuyjqR2n37vj@cluster0.99lyy.mongodb.net/kaibotdb?retryWrites=true&w=majority';

module.exports = async () => {
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    return mongoose;
};