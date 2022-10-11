const router = require('express').Router()
const connection = require('../config/database')
const Broker = connection.models.Broker
const Stock = connection.models.Stock
const isAuth = require('./authMiddleware').isAuth
const axios = require('axios')
const params = {
    access_key: 'ec588881196c2e9ea6f4ac3b6437830d'
}

const WebSocket = require('isomorphic-ws')
const protobuf = require('protobufjs') // import protobuf from 'protobufjs'
const {Buffer} = require('buffer/')
const ws = new WebSocket('wss://streamer.finance.yahoo.com')

protobuf.load('./config/YPricingData.proto', (error, root)=>{
    if(error){return console.log(error)}
    const YaTicker = root.lookupType('yaticker')
    ws.onopen = function open(){
        console.log('connected')
        ws.send(JSON.stringify({
            subscribe: ['GME']
        }))
    }
    ws.onclose = function close(){
        console.log('disconnected')
    }
    ws.onmessage = function incoming(message){
        console.log('comming message')
        console.log(YaTicker.decode(new Buffer(message.data,'base64')))
    }

})





router.get('/', isAuth,(req,res)=>{
    let broker = req.user
    res.render('home/home',{broker: broker})
})

router.get('/new', isAuth,(req,response)=>{

})

module.exports = router