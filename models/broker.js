const mongoose = require('mongoose')

const brokerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Broker', brokerSchema)