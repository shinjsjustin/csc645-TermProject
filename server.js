if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const MongoStore = require('connect-mongo')

//Basics
app.set('view engine','ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))

app.use(flash())
app.use(methodOverride('_method'))
app.use(express.json())


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

require('./config/passport')

const enterRouter = require('./routes/enter')
const homeRouter = require('./routes/home')
app.use('/', enterRouter) 
app.use('/home', homeRouter)

//All brokers page
// app.get('/brokers', async (req,res) =>{
//     let searchOptions = {}
//     if(req.query.username != null && req.query.username !== ''){
//         searchOptions.username = new RegExp(req.query.username, 'i')
//     }
//     try{
//         const brokers = await Broker.find(searchOptions)
//         res.render('brokers/index', {
//             brokers: brokers,
//             searchOptions: req.query
//         })
//     }catch{
//         res.redirect('/')
//     }
// })

//Go to Register page
// app.get('/brokers/new', (req,res) =>{
//     res.render('brokers/new', {broker: new Broker()})
// })



//Create new broker
// app.post('/brokers/new', async (req,res) =>{
//     const saltHash = genPassword(req.body.password)
//     const salt = saltHash.salt;
//     const hash = saltHash.hash;

//     const broker = new Broker({
//         username: req.body.username,
//         email: req.body.email,
//         hash: hash,
//         salt: salt
//     })
//     try{
//         const newBroker = await broker.save()
//         res.redirect(`/brokers/${newBroker.id}`)
//     }catch{
//         res.render('brokers/new', {
//             broker: broker,
//             errorMessage: 'Error creating broker'
//         })
//     }
// })



//Load login page
// app.get('/brokers/:id/login', async(req,res)=>{
//     try{
//         const broker = await Broker.findById(req.params.id)
//         res.render('brokers/login', {broker: broker})
//     }catch{
//         res.redirect('/brokers')

//     }
// })

//Press login button
// app.post('/brokers/:id/login', passport.authenticate('local',{
//     failureRedirect:'/fail',
//     successRedirect:"/success", //Going to be '/brokers/:id'
//     failureFlash: true
// }),(err,req,res,next)=>{
//     console.log(req.body)
//     if(err){
//         console.log(err)
//         next(err)
//     }
// })



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

// app.delete('/brokers/:id', async (req,res)=>{
//     let broker
//     try{
//         broker = await Broker.findById(req.params.id)
//         await broker.remove()
//         res.redirect(`/brokers`)
//     }catch{
//         if(broker == null){
//             res.redirect('/')
//         }else{
//             res.redirect(`/brokers/${broker.id}`)
//         }
//     }
// })

app.listen(process.env.PORT || 3000)