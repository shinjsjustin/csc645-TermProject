const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const Broker = require('./models/broker')

const broker = mongoose.model('Broker', brokerSchema)

function initialize(passport){
    // const authenticateUser = async(email,password,done) =>{
    //     const user = getUserByEmail(email)
    //     if (user == null){
    //         return done(null, false,{message: 'no user with that email'})
    //     }

    //     try{
    //         if(await bcrypt.compare(password, user.password)){
    //             return done(null, user)
    //         }else{
    //             return done(null, false,{message: 'incorrect password'})
    //         }
    //     }catch(e){
    //         return done(e)
    //     }
    // }
    // passport.use(new LocalStrategy({usernameField: 'email'}), authenticateUser)

    passport.use(new LocalStrategy(function(username,password,done){
        broker.findOne({username:username}, function(err,user){
            if(err) return done(err)
            if(!user) return done(null,false,{message:"No User Fount"})
            bcrypt.compare(password,user.password,function(err,res){
                if(err) return done(err)
                if(res===false) return done(null, false, {message:"Incorrect Password"})
                return done(null, user)
            })
        })
    }))

    passport.serializeUser((user,done)=>{})
    passport.deserializeUser((id,done)=>{})
}

module.exports = initialize