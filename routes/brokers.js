const express = require('express')
const router = express.Router()
const Broker = require('../models/broker')

//Display all brokers
router.get('/', async (req,res) =>{
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const brokers = await Broker.find({})
        res.render('brokers/index',{brokers:brokers})
    }catch{
        res.redirect('/')
    }
})

// New Broker
router.get('/new', (req,res) =>{
    res.render('brokers/new', {broker: new Broker()})
})

// Create Broker
router.post('/', async (req,res) =>{
    const broker = new Broker({
        name: req.body.name
    })
    try{
        const newBroker = await broker.save()
        // res.redirect(`brokers/${newBroker.id}`)
        res.redirect(`brokers`)
    }catch{
        res.render('brokers/new', {
            broker: broker,
            errorMessage: 'Error creating broker'
        })
    }
})
 
module.exports = router