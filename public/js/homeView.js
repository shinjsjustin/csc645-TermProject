var stockSymbols = []
const symbols = window.document.getElementsByClassName('stockSymbol')
for(var s of symbols){
    stockSymbols.push(s.innerHTML)
}
console.log(stockSymbols)

const socket = new WebSocket('wss://streamer.finance.yahoo.com')
// const root = protobuf.load('/YPricingData.proto')
// const yaticker = root.lookupType('yaticker')

protobuf.load('YPricingData.proto',(err, root)=>{
    if(err){return console.log(err)}
    const YaTicker = root.lookupType('yaticker')

    socket.onopen = function open(){
        console.log('connected')
        socket.send(JSON.stringify({
            subscribe: stockSymbols
        }))
    }
    socket.onmessage = function incomming(message){
        // console.log('incoming')
        const d = YaTicker.decode(buffer.Buffer.from(message.data, 'base64'))
        // console.log(d.id)
        // console.log(d.price)
        updateWindow(d.id, d.price)
    }
})

function updateWindow(id, price){
    let p = price.toFixed(2)
    const y = window.document.getElementById(id)
    let x = y.innerHTML
    // console.log(x + ", " + p)
    y.innerHTML = p
    if(x > p){
        y.parentElement.closest('div').style.borderColor = 'red'
    }else{
        y.parentElement.closest('div').style.borderColor = 'green'
    }
}