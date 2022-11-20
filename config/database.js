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
        required: true,
        unique: true
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
    symbol: {
        type: String
    },
    ownedBy: {
        type: String,
        required: true
    }, 
    volume: {
        type: Number
    },
    price: {
        type: Number
    },
    time: {
        type: Number
    },
    money:{
        type: Number
    }
})

const Stock = connection.model('Stock', stockSchema)

const loanSchema = new mongoose.Schema({
    lName:{
        type: String,
    },
    lAmount:{
        type: Number,
        required: true,
    },
    givenTo:{
        type: String,
        required: true
    }
})

const Loan = connection.model('Loan', loanSchema)

module.exports = connection