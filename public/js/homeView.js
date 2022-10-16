const WebSocket = require('isomorphic-ws')
const protobuf = require('protobufjs') 
const {Buffer} = require('buffer/')
const ws = new WebSocket('wss://streamer.finance.yahoo.com')

function getLiveStock(symbol){
    protobuf.load('./config/YPricingData.proto', (error, root)=>{
        if(error){return console.log(error)}
        const YaTicker = root.lookupType('yaticker')
        ws.onopen = function open(){
            console.log('connected')
            ws.send(JSON.stringify({
                subscribe: ['symbol']
            }))
        }
        ws.onclose = function close(){
            // console.log('disconnected')
        }
        ws.onmessage = function incoming(message){
            // console.log('comming message')
            //return YaTicker.decode(new Buffer(message.data,'base64'))
            console.log(YaTicker.decode(new Buffer(message.data,'base64')))
        }
    })
}
protobuf.load('./config/YPricingData.proto', (error, root)=>{
    if(error){return console.log(error)}
    const YaTicker = root.lookupType('yaticker')
    ws.onopen = function open(){
        console.log('connected')
        ws.send(JSON.stringify({
            subscribe: ['AAPL']
        }))
    }
    ws.onclose = function close(){
        // console.log('disconnected')
    }
    ws.onmessage = function incoming(message){
        // console.log('comming message')
        //return YaTicker.decode(new Buffer(message.data,'base64'))
        console.log(YaTicker.decode(new Buffer(message.data,'base64')))
    }
})



function updateStockPrice(symbol, num){
    document.getElementById("liveInstance" + symbol).innerHTML = num
}