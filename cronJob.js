const cron = require('node-cron');
const session = require('express-session');
const MongoDBSessionStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');

// Initialize the session store
const store = new MongoDBSessionStore({
    uri: process.env.MONGODB_CONNECT_URI,
    collection: 'sessions',
});

// Cron job to delete expired sessions
const deleteExpiredSessions = () => {
    cron.schedule('* * * * *', async () => { // Runs every day at midnight
        try {
            const currentDate = new Date();
            // Delete expired sessions directly from the database
            const Deleted = await store.collection.deleteMany({ expires: { $lt: currentDate } });
            if(Deleted.deletedCount > 0){
                console.log('Expired sessions deleted successfully.');
            } //else {
                //console.log('Nothing to delete')
            //}
        } catch (error) {
            console.error('Error deleting expired sessions:', error);
        }
    });
};

module.exports = deleteExpiredSessions;
