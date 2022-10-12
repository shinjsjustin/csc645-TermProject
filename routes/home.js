const router = require('express').Router()
const connection = require('../config/database')
const Broker = connection.models.Broker
const Stock = connection.models.Stock
const isAuth = require('./authMiddleware').isAuth


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