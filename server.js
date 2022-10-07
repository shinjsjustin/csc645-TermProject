if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const app = express()
const crypto = require('crypto')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const localStrategy = require('passport-local').Strategy
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')


const Broker = require('./models/broker')
const indexRouter = require('./routes/index')

//Basics
app.set('view engine','ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))

//Database
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser: true, useUnifiedTopology:true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Database'))

//Basics
app.use(flash())
app.use(methodOverride('_method'))
app.use(express.json())

console.log("hello")

//Passport
passport.use(new localStrategy(function verify(username,password,cb){
    console.log("here")
    console.log(username, password)
    Broker.findOne({username:username}).then((user)=>{
        if(!user){return cb(null,false)}
        const isValid = validPassword(password, user.hash, user.salt)
        if(isValid){return cb(null,user)}
        else{return cb(null,false)}
    }).catch((err) => {cb(err)})
}))
passport.serializeUser(function(user,done){
    done(null,user.id)
})
passport.deserializeUser(function(id,done){
    Broker.findById(id, function(err,user){
        done(err,user)
    })
})

//Sessions
const sessionStore = new MongoStore({ mongoUrl: process.env.DATABASE_URL, collection: 'sessions' })
app.use(session({
    secret: "Secret",
    resave:false,
    saveUninitialized:false,
    store: sessionStore,
    cookie:{maxAge:1000*60*60*4}
}))
app.use(passport.initialize())
app.use(passport.session())



app.use('/', indexRouter) 
// app.use('/brokers', brokerRouter)

//All brokers page
app.get('/brokers', async (req,res) =>{
    let searchOptions = {}
    if(req.query.username != null && req.query.username !== ''){
        searchOptions.username = new RegExp(req.query.username, 'i')
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

//Go to Register page
app.get('/brokers/new', (req,res) =>{
    res.render('brokers/new', {broker: new Broker()})
})

//Show broker TODO!!
app.get('/brokers/:id', async (req,res)=>{
    // let searchOptions = {}
    // if(req.query.name != null && req.query.name !== ''){
    //     searchOptions.name = new RegExp(req.query.name, 'i')
    // }
    // try{
    //     const stocks = await Stock.find(searchOptions)
    //     res.render('stocks/stocks',{
    //         stocks: stocks,
    //         searchOptions: req.query
    //     })
    // }catch{
    //     res.send('huhhhh')
    // }
    res.redirect('/')
})


//Create new broker
app.post('/brokers/new', async (req,res) =>{
    const saltHash = genPassword(req.body.password)
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const broker = new Broker({
        username: req.body.username,
        email: req.body.email,
        hash: hash,
        salt: salt
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



//Load login page
app.get('/brokers/:id/login', async(req,res)=>{
    try{
        const broker = await Broker.findById(req.params.id)
        res.render('brokers/login', {broker: broker})
    }catch{
        res.redirect('/brokers')

    }
})

//Press login button
app.post('/brokers/:id/login', passport.authenticate('local',{
    failureRedirect:'/fail',
    successRedirect:"/success", //Going to be '/brokers/:id'
    failureFlash: true
}),(err,req,res,next)=>{
    console.log(req.body)
    if(err){
        console.log(err)
        next(err)
    }
})

//Testing purposes
app.get('/success', (req,res)=>{
    res.send('Success')
})
//Testing purposes
app.get('/fail',(req,res)=>{
    console.log('fail')
    res.send('Fail')
})

//Edit Broker
// app.put('/brokers/:id', async (req, res)=>{
//     let broker
//     try{
//         broker = await Broker.findById(req.params.id)
//         broker.name = req.body.name
//         await broker.save()
//         res.redirect(`/brokers`)
//     }catch{
//         if(broker == null){
//             res.redirect('/')
//         }else{
//             res.render('brokers/edit', {
//                 broker: broker,
//                 errorMessage: 'Error editing broker'
//             })
//         }
//     }
// })

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
    console.log('not authorized')
    res.redirect('/')
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        console.log('authenticated!')
        return res.redirect('/brokers')
    }
    next()
}

function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === hashVerify
}
function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex')
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    
    return {
      salt: salt,
      hash: genHash
    }
}

app.listen(process.env.PORT || 3000)