const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const Broker = require('./models/broker')

function initialize(passport, broker){
    const authenticateUser = async (email,password,done) =>{
        
        if(broker){
            return done(null, false, {message: 'No user with that email'})
        }

        try{
            if(await bcrypt.compare(password,broker.password)){
                return done(null, user)
            }else{
                return done(null,false,{message:'Password Incorrect'})
            }
        }catch(e){
            return done(e)
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user,done)=>done(null,user.id))
    passport.deserializeUser((id,done)=>{
        return done(null,getUserById(id))
    })
}

module.exports = initialize