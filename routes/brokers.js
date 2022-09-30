const express = require('express')
const broker = require('../models/broker')
const router = express.Router()
const Broker = require('../models/broker')

//Display all brokers
router.get('/', async (req,res) =>{
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const brokers = await Broker.find(searchOptions)
        res.render('brokers/index', {
            brokers: brokers,
            searchOptions: req.query
        })
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

router.get('/:id', (req,res)=>{
    res.send('Show Broker ' + req.params.id)
})

router.get('/:id/edit', async(req,res)=>{
    try{
        const broker = await Broker.findById(req.params.id)
        res.render('brokers/edit', {broker: broker})
    }catch{
        res.redirect('/brokers')

    }
})

router.put('/:id', async (req, res)=>{
    let broker
    try{
        broker = await Broker.findById(req.params.id)
        broker.name = req.body.name
        await broker.save()
        res.redirect(`/brokers/${broker.id}`)
    }catch{
        if(broker == null){
            res.redirect('/')
        }else{
            res.render('brokers/edit', {
                broker: broker,
                errorMessage: 'Error creating broker'
            })
        }
    }
})

router.delete('/:id', async (req,res)=>{
    let broker
    try{
        broker = await Broker.findById(req.params.id)
        await broker.remove()
        res.redirect(`/brokers`)
    }catch{
        if(broker == null){
            res.redirect('/')
        }else{
            res.redirect(`/brokers/${broker.id}`)
        }
    }
})


 
module.exports = router