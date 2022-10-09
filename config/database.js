const mongoose = require('mongoose')
require('dotenv').config()

const conn = process.env.DATABASE_URL

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

connection.on('error', error => console.error(error))
connection.once('open', () => console.log('Connected to Database'))

const brokerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    hash: {
        type: String
    },
    salt: {
        type: String
    },
    netWorth: {
        type: Number
    },
    liquidCash: {
        type: Number
    }

})

const Broker = connection.model('Broker', brokerSchema)

const stockSchema = new mongoose.Schema({
    stockName: {
        type: String
    },
    ownedBy: {
        type: String
    }, 
    numShares: {
        type: Number
    },
    sharePrice: {
        type: Number
    },
    boughtOn: {
        type: Date
    },
})

const Stock = connection.model('Stock', stockSchema)

module.exports = connection