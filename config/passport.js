const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const connection = require('./database')
const Broker = connection.models.Broker
const validPassword = require('./passwordUtils').validPassword

passport.use(new localStrategy(function verify(username,password,cb){
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