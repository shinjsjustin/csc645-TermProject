if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const localStrategy = require('passport-local').Strategy
const methodOverride = require('method-override')


const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')


const Broker = require('./models/broker')
const indexRouter = require('./routes/index')
// const brokerRouter = require('./routes/brokers')

app.set('view engine','ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(flash())
app.use(session({
    secret: "Secret",
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

passport.serializeUser(function(user,done){
    done(null,user.id)
})
passport.deserializeUser(function(id,done){
    Broker.findById(id, function(err,user){
        done(err,user)
    })
})
passport.use(new localStrategy(function(username,password,done){
    Broker.findOne({username:username}, function(err,user){
        if(err) return done(err)
        if(!user) return done(null,false,{message:"Incorrect Username"})

        bcrypt.compare(password,user.password, function(err,res){
            console.log('wrong pass')
            if(err) return done(err)
            if(res === false) return done(null,false,{message: 'Incorrect Password'})
            return done(null, user)
        })
    })
}))

app.use('/', indexRouter) 
// app.use('/brokers', brokerRouter)

app.get('/brokers', async (req,res) =>{
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

app.get('/brokers/new', (req,res) =>{
    res.render('brokers/new', {broker: new Broker()})
})

app.post('/brokers/new', async (req,res) =>{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const broker = new Broker({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
    try{
        const newBroker = await broker.save()
        res.redirect(`/brokers/${newBroker.id}`)
    }catch{
        res.render('brokers/new', {
            broker: broker,
            errorMessage: 'Error creating broker'
        })
    }
})

app.get('/brokers/:id', (req,res)=>{
    res.redirect('/')
})

app.get('/brokers/:id/login', async(req,res)=>{
    try{
        const broker = await Broker.findById(req.params.id)
        res.render('brokers/login', {broker: broker})
    }catch{
        res.redirect('/brokers')

    }
})

app.post('/brokers/:id/login', checkNotAuthenticated, passport.authenticate('local',{
    successRedirect:"/success",
    failureRedirect:'/fail',
    failureFlash: true
}))

app.get('/success', checkAuthenticated, (req,res)=>{
    console.log('suc')
    res.send('Success')
})

app.get('/fail', (req,res)=>{
    console.log('fail')
    res.send('Fail')
})

app.put('/brokers/:id', async (req, res)=>{
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

app.delete('/brokers/:id', async (req,res)=>{
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
        console.log('authenticated!')
        return res.redirect('/brokers')
    }
    next()
}

app.listen(process.env.PORT || 3000)