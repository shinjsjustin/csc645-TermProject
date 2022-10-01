if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => user.find(user=>user.email===email),
    id => user.find(user=>user.id===id)
)

const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')


const Broker = require('./models/broker')
const indexRouter = require('./routes/index')
const brokerRouter = require('./routes/brokers')

app.set('view engine','ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
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


app.use('/', indexRouter) 
app.use('/brokers', brokerRouter)

// app.get('/:id/login', async(req,res)=>{
//     try{
//         const broker = await Broker.findById(req.params.id)
//         res.render('brokers/login', {broker: broker})
//     }catch{
//         res.redirect('/brokers')

//     }
// })

// app.post('/:id/login', passport.authenticate('local',{
//     successRedirect:"/home",
//     failureRedirect:'/login',
//     failureFlash: true
// }))

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

app.listen(process.env.PORT || 3000)