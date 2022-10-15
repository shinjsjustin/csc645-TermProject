const router = require('express').Router()
const connection = require('../config/database')
const Broker = connection.models.Broker
const Stock = connection.models.Stock
const isAuth = require('./authMiddleware').isAuth

const WebSocket = require('isomorphic-ws')
const protobuf = require('protobufjs') 
const {Buffer} = require('buffer/')
const ws = new WebSocket('wss://streamer.finance.yahoo.com')

// protobuf.load('./config/YPricingData.proto', (error, root)=>{
//     if(error){return console.log(error)}
//     const YaTicker = root.lookupType('yaticker')
//     ws.onopen = function open(){
//         console.log('connected')
//         ws.send(JSON.stringify({
//             subscribe: ['TSLA']
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


router.get('/', isAuth, async(req,res)=>{
    let broker = req.user
    // const url = 'https://query2.finance.yahoo.com/v7/finance/quote?symbols=UBER'
    // fetch(url,{method:"GET"})
    //     .then((response)=>{
    //         console.log(response)
    //         return response.json()
    //     })
    //     .then((data)=>{
    //         console.log(data)
    //         let x = data.quoteResponse.result[0].postMarketPrice
    //         console.log("!!!" + x + "!!!")
    //     })
    try{
        const stocks = await Stock.find({'ownedBy':broker.username})
        res.render('home/home',{broker: broker, stocks: stocks})
    }catch{
        res.send('error with get slash')
    }
})

router.post('/new', async(req,res)=>{
    const stonk = new Stock({
        stockName: req.body.stockName,
        ownedBy: req.user.username,
        numShares: 5,
        sharePrice: 10,
        boughtOn: new Date()
    })
    try{
        await stonk.save()
        res.redirect('/')
    }catch{
        res.send('error creating stock')
    }
})

router.delete('/delete/:id', async(req,res)=>{
    let stock
    try{
        stock = await Stock.findById(req.params.id)
        await stock.remove()
        res.redirect('/')
    }catch{
        res.send('error deleting stock')
    }
})

module.exports = router