const socket = new WebSocket('wss://streamer.finance.yahoo.com')
//import "YPricingData.proto"
//import protobuf from 'protobufjs'

async function decodeM(buffer){
    const root = await protobuf.load("YPricingData.proto")
    const testMessage = root.lookupType('yaticker')
    const err = testMessage.verify(buffer);
    if(err){
        throw err;
    }
    const message = testMessage.decode(buffer);
    return testMessage.toObject(message)
}

// const x = window.document.getElementById('testtt')
// x.innerHTML = "HELLLLLLLLO"

// const y = window.document.getElementsByClassName('stockList')
// console.log(y)
// for(const child of y[0]){
//     console.log(child)
// }
var stockSymbols = []
const symbols = window.document.getElementsByClassName('stockSymbol')
for(var s of symbols){
    stockSymbols.push(s.innerHTML)
}


socket.addEventListener('open',function(event){
    console.log("connected to websocket")
    socket.send(JSON.stringify({
        subscribe:stockSymbols
    }))
})

socket.addEventListener('message', function(message){
    console.log('incoming')
    console.log(decodeM(message.data))
})

