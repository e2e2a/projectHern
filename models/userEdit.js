var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
// const DateOnly = require('mongoose-dateonly')(mongoose);
var schema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    fullname: {
        type: String,
    },
    email: {
        type: String,
    },
    contact: {
        type: String,
    },
    address: {
        type: String,
    },
    relatives: [{
        relativeName: String,
        relativeEmail: String,
    }],
    password: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
}, {
    versionKey: false,
    timestamps: true
}
);

schema.pre('save', function (next) {

    var user = this;

    // generate a salt

    if (user.isModified("password") || user.isNew) {

        bcrypt.genSalt(10, function (error, salt) {

            if (error) return next(error);

            // hash the password along with our new salt

            bcrypt.hash(user.password, salt, function (error, hash) {

                if (error) return next(error);

                // override the cleartext password with the hashed one

                user.password = hash;

                next(null, user);
            });
        });

    } else {
        next(null, user);
    }
});

/**
 * Compare raw and encrypted password
 * @param password
 * @param callback
 */
schema.methods.comparePassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (error, match) {
        if (error) callback(error);
        if (match) {
            callback(null, true);
        } else {
            callback(error, false);
        }
    });
}

module.exports = mongoose.model("UsersEdit", schema, "UsersEdit");