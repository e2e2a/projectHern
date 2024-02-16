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
    categoryCOD: {
        type: String,
        enum: ['Natural', 'Accident', 'Murder', 'Unknown', 'Suicide', 'Homicide'],
        required: true
    },
    nameCementery: {
        type: String,
    },
}, {
    versionKey: false,
    timestamps: true
}
);
schema.set('toJSON', { getters: true });

module.exports = mongoose.model('Product', schema);