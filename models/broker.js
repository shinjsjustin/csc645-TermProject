const mongoose = require('mongoose')

const brokerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    hash: {
        type: String
    },
    salt: {
        type: String
    }
})

module.exports = mongoose.model('Broker', brokerSchema)