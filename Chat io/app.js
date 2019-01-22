var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bodyparser = require("body-parser");
var path = require("path");
var cookieparser = require("cookie-parser");
var session = require("express-session");
var mongoose = require('mongoose');
var expressvalidator = require("express-validator");
var user = require('./modals/user');
var admin = require('./modals/admin');
users = [];
connections = [];

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect('mongodb://localhost:27017/web', function (err) {
    if (err)
        res.status(500).send('error');
    else
        console.log('connection created to db');
});





app.set('view engine', 'ejs');
app.use(express.static('css'));
app.use(express.static('images'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(expressvalidator());

app.use(cookieparser());
app.use(session({
    secret: 'cant tell',
    saveUninitialized: true,
    resave: true
}));


function checkauth(req, res, next) {
    if (req.session.email && req.session.admin) {
        return next();
    }
    else if (req.session.email && req.session.user) {
        return next();
    }
    else {
        res.send('nnnnnn');
    }
}


app.get("/", function (req, res) {
    res.render('main');
});

app.post("/user", function (req, res) {

    req.checkBody('tfname', 'enter valid first name').notEmpty().isLength({ min: 3, max: 8 }).isAlpha(),
        req.checkBody('tlname', 'enter valid last name').notEmpty().isLength({ min: 3, max: 8 }).isAlpha(),
        req.checkBody('temail', 'enter valid email').notEmpty().isEmail(),
        req.checkBody('tpassword', 'enter valid password').notEmpty().isLength({ min: 8 }),
        req.checkBody('tcpassword', 'Password not matched').equals(req.body.tpassword)

    var errors = req.validationErrors();
    if (errors) {
        res.send(errors);
    }
    else {
        user.findOne({ 'email': req.body.temail }, function (err, doc) {
            if (err)
                res.send("Error");
            else if (doc) {
                res.send('user already exists');
            }
            else {

                var newuser = new user();
                newuser.firstName = req.body.tfname;
                newuser.lastName = req.body.tlname;
                newuser.email = req.body.temail;
                newuser.password = req.body.tpassword;
                newuser.confirm_password = req.body.tcpassword;
                newuser.save(function (err, user) {
                    if (err)
                        throw err
                    else
                        res.send("user added successfully" + user);
                });
            }
        });
    }
});



app.post('/login', function (req, res) {


    var logemail = req.body.logemail;
    var logpassword = req.body.logpassword;

    req.checkBody('logemail', 'email in invalid').notEmpty().isEmail(),
        req.checkBody('logpassword', 'password invalid').notEmpty().isLength({ min: 8 })

    var errors = req.validationErrors();

    if (errors)
        res.send(errors);
    else {

        admin.findOne({ email: logemail, password: logpassword }, function (err, doc) {
            if (err)
                res.status(500).send('error');
            else if (doc) {
                req.session.email = logemail;
                req.session.admin = true;
                res.redirect('/page');
            }
            else {
                user.findOne({ email: logemail, password: logpassword }, function (err, doc) {
                    if (err)
                        throw err;
                    else if (doc) {
                        req.session.email = logemail;
                        req.session.user = true;
                        res.redirect('/user_page');
                    }
                    else {
                        res.send('Wrong user info or user dont exist');
                    }
                });
            }

        });

    }

});

app.get('/page', checkauth, function (req, res) {
    res.send("login successful");
});


app.get('/user_page', checkauth, function (req, res) {
    res.sendFile(__dirname + '/views/user.html');
});


io.on('connection', (socket) => {
    console.log('New user connected');

    //default username
    socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    });

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', { message: data.message, username: socket.username });
    });

    //listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { username: socket.username })
    });
});




server.listen(8080, function (err) {
    if (err)
        throw err;
    else
        console.log("server running");
});

