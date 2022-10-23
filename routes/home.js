const router = require('express').Router()
const connection = require('../config/database')
const Broker = connection.models.Broker
const Stock = connection.models.Stock
const isAuth = require('./authMiddleware').isAuth

const WebSocket = require('isomorphic-ws')
const protobuf = require('protobufjs') 
const {Buffer} = require('buffer/')
const ws = new WebSocket('wss://streamer.finance.yahoo.com')
protobuf.load('./config/YPricingData.proto', (error, root)=>{
    if(error){return console.log(error)}
    const YaTicker = root.lookupType('yaticker')
    ws.onopen = function open(){
        console.log('connected')
        ws.send(JSON.stringify({
            subscribe: ['TSLA']
        }))
    }
    ws.onclose = function close(){
    }
    ws.onmessage = function incoming(message){

        //return YaTicker.decode(new Buffer(message.data,'base64'))
        console.log(YaTicker.decode(new Buffer(message.data,'base64')))
    }
})

const url = 'https://query2.finance.yahoo.com/v7/finance/quote?symbols='

// const ttt = document.getElementById("testtt")



router.get('/', isAuth, async(req,res)=>{

    let broker = req.user
    try{
        const stocks = await Stock.find({'ownedBy':broker.username})
        res.render('home/home',{broker: broker, stocks: stocks})
    }catch{
        res.send('error with get slash')
    }
})

router.post('/new', async(req,res)=>{
    const name = req.body.stockName
    const money = req.body.moneySpent
    var stonk
    var price
    var volume
    var time
    var u = url + name
    fetch(u,{method:"GET"})
        .then((response)=>{
            return response.json()
        })
        .then(async (data)=>{
            price = (data.quoteResponse.result[0].postMarketPrice).toFixed(2)
            volume = data.quoteResponse.result[0].regularMarketVolume
            time = data.quoteResponse.result[0].regularMarketTime
            stonk = new Stock({
                symbol: req.body.stockName,
                ownedBy: req.user.username,
                volume: volume,
                price: price,
                time: time,
                money: money
            })

            try{
                req.user.liquidCash = req.user.liquidCash - money
                await req.user.save()
                await stonk.save()
                res.redirect('/')
            }catch{
                res.send('error creating stock')
            }
        })
        .catch((err)=>{
            console.log(err)
            res.redirect('/')
        })
})

router.delete('/delete/:id', async(req,res)=>{
    var stock, volume, u, price, money, v, p, c
    try{
        stock = await Stock.findById(req.params.id)
        u = url + stock.symbol
        money = stock.money
        price = stock.price
        volume = stock.volume
        fetch(u,{method:"GET"})
        .then((response)=>{
            return response.json()
        })
        .then(async (data)=>{
            p = (data.quoteResponse.result[0].postMarketPrice).toFixed(2)
            v = data.quoteResponse.result[0].regularMarketVolume
            c = p*v*money/price/volume
            req.user.liquidCash = req.user.liquidCash + c
            await req.user.save()
            await stock.remove()
            res.redirect('/')
        })
        .catch((e)=>{
            console.log(e)
        })
        
    }catch{
        res.send('Could not sell')
    }
})

module.exports = router