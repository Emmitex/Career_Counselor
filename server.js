if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}


// Importoing libraries that we installed using npm
const express = require("express");
const app = express()
const bcrypt = require("bcrypt")  // Importing bcrypt packages
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const userModel = require("./models/user.model")
const bodyParser = require('body-parser');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.on('connection', () => { /* … */ });

// Serve the frontend code as a static file
app.use(express.static('views'));

// Handle requests to the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/dashboard.ejs');
});


// // Set up the navigation bar
// app.get('/', (req, res) => {
//     res.send(`
//       <nav>
//         <a href="/">Home</a>
//         <a href="/chat">Chat</a>
//         <a href="/dashboard">Dashboard</a>
//       </nav>
//       <h1>Home</h1>
//     `);
//   });
  
//   app.get('/chat', (req, res) => {
//     res.send(`
//       <nav>
//         <a href="/">Home</a>
//         <a href="/chat">Chat</a>
//         <a href="/dashboard">Dashboard</a>
//       </nav>
//       <h1>Chat</h1>
//     `);
//   });
  
//   app.get('/dashboard', (req, res) => {
//     res.send(`
//       <nav>
//         <a href="/">Home</a>
//         <a href="/chat">Chat</a>
//         <a href="/dashboard">Dashboard</a>
//       </nav>
//       <h1>Dashboard</h1>
//       <p>Welcome to your dashboard, user!</p>
//     `);
//   });
  
  // Set up Socket.io for real-time messaging
  io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      io.emit('chat message', msg);
    });
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
  
//   app.use(express.static('public'));


const multer = require('multer')
const mysql = require('mysql');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'career_counsellor'
  });
  
  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
  });


app.post('/search-user', (req, res) => {
    const name = req.body.name;
  
    const sql = `SELECT * FROM users WHERE name = '${name}'`;
  
    connection.query(sql, (err, result) => {
        if (err) throw err;
        res.render('search-results', { user: result[0] });
      });
    });
  

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })


app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

initializePassport(
    passport,
    email => userModel.findOne({ where: { email } }),
    id => userModel.findOne({ where: { id } })
)



app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // we wont resave the session variable
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 6000000
    }

}))
app.use(passport.initialize())
app.use(passport.session())

// configuring the signin post functionality
app.post("/signin", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/signin",
    failureFlash: true
}))

// configuring the signup post functionality
app.post("/signup", upload.single('image'), async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        console.log(req.file);
        userModel.create({
            id: Date.now().toString,
            name: req.body.name,
            email: req.body.email,
            career: req.body.career,
            image: JSON.stringify(req.file.filename),
            dob: req.body.dob,
            password: hashedPassword,
            usertype: req.body.usertype,
        })

        return res.redirect("/signin")
    } catch (e) {
        console.log(e);
        res.redirect("/signup")

    }
})


// using app.use to serve up static CSS files in public/assets/ folder when /public link is called in ejs files
// app.use("/route", express.static("foldername"));
app.use(express.static("assets"));
// Routes
app.get('/index', (req, res) => {
    res.render("index.ejs")
})

app.get('/signin', (req, res) => {
    res.render("signin.ejs")
})

app.get('/signup', (req, res) => {
    res.render("signup.ejs")
})

app.get('/dashboard', isauth, async (req, res) => {
    // console.log("jjxjdjj");
    console.log(req.user);
    const name = await req.user
    res.render("dashboard.ejs", { name })
})


// End Routes


function isauth(req, res, next) {

    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/signin')
    }
}

app.listen(3000);