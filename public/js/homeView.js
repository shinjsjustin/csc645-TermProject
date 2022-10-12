// const WebSocket = require('isomorphic-ws')
// const protobuf = require('protobufjs') 
// const {Buffer} = require('buffer/')
// const ws = new WebSocket('wss://streamer.finance.yahoo.com')

// protobuf.load('./config/YPricingData.proto', (error, root)=>{
//     if(error){return console.log(error)}
//     const YaTicker = root.lookupType('yaticker')
//     ws.onopen = function open(){
//         console.log('connected')
//         ws.send(JSON.stringify({
//             subscribe: ['META']
//         }))
//     }
//     ws.onclose = function close(){
//         console.log('disconnected')
//     }
//     ws.onmessage = function incoming(message){
//         console.log('comming message')
//         console.log(YaTicker.decode(new Buffer(message.data,'base64')))
//     }
// })

console.log('huh')
document.getElementById('testButton').addEventListener('click', populate)

function populate(event){
    console.log('populate')
    event.preventDefault()
    addDiv('test')    
}

function formatPrice(price){
    return `$${price.toFixed(2)}`
}



