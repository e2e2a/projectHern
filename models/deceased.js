var mongoose = require("mongoose");


var schema = mongoose.Schema({

    fullname: {
        type: String,
    },
    deathDate: {
        type: String,
    },
    placeDeath: {
        type: String,
    },
    birthDate: {
        type: String,
    },
    placeBirth: {
        type: String,
    },
    ageDeath: {
        type: String,
    },
    gender: {
        type: String,
    },
    occupation: {
        type: String,
    },
    civilStatus: {
        type: String,
    },
    religion: {
        type: String,
    },
    citizenship: {
        type: String,
    },
    description: {
        type: String,
        unique: false
    },
    causeDeath: {
        type: String,
        enum: ['Natural', 'Accident', 'Murder', 'Unknown', 'Suicide', 'Homicide'],
        required: true
    },
    guardian: {
        type: String,
    },
    guardianEmail: {
        type: String,
    },
    nameCemetery: {
        type: String,
    },
}, {
    versionKey: false,
    timestamps: true
}
);
schema.set('toJSON', { getters: true });

module.exports = mongoose.model('Deceaseds', schema ,'Deceaseds');