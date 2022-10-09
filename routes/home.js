const router = require('express').Router()
const connection = require('../config/database')
const Broker = connection.models.Broker
const Stock = connection.models.Stock
const isAuth = require('./authMiddleware').isAuth

router.get('/', isAuth,(req,res)=>{
    let broker = req.user
    res.render('home/home',{broker: broker})
})

router.post('/new', isAuth,(req,res)=>{
    
})

module.exports = router