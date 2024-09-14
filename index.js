const express = require("express");
const dotenv = require("dotenv");
const session = require('express-session');
const cookieParser = require('cookie-parser');
dotenv.config({ path: './.env'});
const app = express();
app.use(cookieParser());
app.use(express.static("public")); //pour le css et img
app.set("view engine", "ejs"); // pour éviter de mettre "".ejs" sur les fichiers

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(3000, function(){
    console.log("The server has started up");
});