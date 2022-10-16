const router = require('express').Router()
const passport = require('passport')
const genPassword = require('../config/passwordUtils').genPassword
const connection = require('../config/database')
const Broker = connection.models.Broker
const isAuth = require('./authMiddleware').isAuth
const isAdmin = require('./authMiddleware').isAdmin
const isNotAuth = require('./authMiddleware').isNotAuth

/* --------------- POST ROUTES --------------- */

router.post('/login', passport.authenticate('local',{
    failureRedirect:'/login-failure',
    successRedirect:"/login-success", //Going to be '/brokers/:id'
    failureFlash: true
}),(err,req,res,next)=>{
    console.log(req.body)
    if(err){
        console.log(err)
        next(err)
    }
})

router.post('/register', async (req,res) =>{
    var u = req.body.username
    var count
    try{
        count = await Broker.countDocuments({username:u})
        if(count > 0){
            res.send('username exists, try again')
        }else{
            const saltHash = genPassword(req.body.password)
            const salt = saltHash.salt;
            const hash = saltHash.hash;
    
            const broker = new Broker({
                username: u,
                hash: hash,
                salt: salt,
                netWorth: 10000,
                liquidCash: 10000
            })
            try{
                await broker.save()
                res.redirect('/login')
            }catch{
                res.send("Error creating user")
            }
        }
    }catch{
        res.send("somethings fucked")
    }
})

/* --------------- GET ROUTES --------------- */

router.get('/', (req,res)=>{
    res.redirect('/register')
})

router.get('/register', isNotAuth, (req,res)=>{
    res.render('brokers/register', {broker: new Broker()})
})

router.get('/login', isNotAuth, (req,res)=>{
    res.render('brokers/login')
})

router.get('/protected-route', isAuth, (req, res, next) => {
    res.send('You made it to the route.')
})

router.get('/admin-route', isAdmin, (req, res, next) => {
    res.send('You made it to the admin route.')
})

// Visiting this route logs the user out
router.get('/logout', isAuth,(req, res, next) => {
    req.logout(function(err){
        if(err){return next(err)} 
        res.redirect('/login')
    })
})

router.get('/login-success', isAuth, async (req, res, next) => {
    res.redirect('/home')
})

router.get('/login-failure', (req, res, next) => {
    console.log('wrong password')
    res.redirect('/register')
})

module.exports = router