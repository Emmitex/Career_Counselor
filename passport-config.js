const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")


function initialize(passport, getUserByEmail, getUserById){
    console.log();
    // Function to authenticate Users
    const authenticateUsers = async(email, password, done) => {
        // Get users by email
        const user = await getUserByEmail(email)
       // console.log(user, "hello");
        if (user == null){
            return done(null, false, {message: "No User found with that Email"})
        }
        try {

            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)                
            } else {
                return done (null, false, {message: "Password Incorrect"})
            }
        } catch (e) {
            console.log(e);
            return done(e)
        }
            

    }

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: "password",
    }, 
    authenticateUsers))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize