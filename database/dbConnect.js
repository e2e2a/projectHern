const { default: mongoose } = require("mongoose");
//hello
const dbConnect = () => {
    try{
        const conn =  mongoose.connect(process.env.MONGODB_CONNECT_URI);
        // const conn = mongoose.connect('mongodb://127.0.0.1/hernan');
        console.log('database connected');
        return conn;
    } catch (error){
        console.log('database error');
    }
};
module.exports = dbConnect;