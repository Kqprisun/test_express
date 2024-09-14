const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
db.connect( (error) => {    // pour savoir si c'est bien lancé
    if(error){
        console.log(error);
    } else {
        console.log("MYSQL connected...");
    }
});

module.exports = db;