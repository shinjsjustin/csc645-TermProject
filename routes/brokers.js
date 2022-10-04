const express = require('express')
const router = express.Router()
const Broker = require('../models/broker')
const bcrypt = require('bcrypt')
const passport = require('passport')
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

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

// New Broker page
router.get('/new', (req,res) =>{
    res.render('brokers/new', {broker: new Broker()})
})

// Create Broker on submit
router.post('/new', async (req,res) =>{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const broker = new Broker({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
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

//View ID
// router.get('/:id', (req,res)=>{
//     res.render('/brokers/login')
// })

// Go to login page
router.get('/:id/login', async(req,res)=>{
    try{
        const broker = await Broker.findById(req.params.id)
        res.render('brokers/login', {broker: broker})
    }catch{
        res.redirect('/brokers')

    }
})

router.post('/:id/login', checkNotAuthenticated, passport.authenticate('local',{
    successRedirect:"/home",
    failureRedirect:'/login',
    failureFlash: true
}))

//Update Id
router.put('/:id', async (req, res)=>{
    let broker
    try{
        broker = await Broker.findById(req.params.id)
        broker.name = req.body.name
        await broker.save()
        res.redirect(`/brokers`)
    }catch{
        if(broker == null){
            res.redirect('/')
        }else{
            res.render('brokers/edit', {
                broker: broker,
                errorMessage: 'Error editing broker'
            })
        }
    }
})

//Delete Id
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

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}
 
module.exports = router