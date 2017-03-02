var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');

var config = {
  host: 'db.imad.hasura-app.io',
  user: 'sgovindan53',
  database: 'sgovindan53',
  port: '5432',
  password: process.env.DB_PASSWORD
}

var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function(hash, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, sha512);
    //return hashed.toString('hex');
    return['pbkdf2', '10000', salt, hashed.toString('hex')].join('$');
}
app.get('/hash/:input', function(req,res){
   // var hashedString = hash(req.params.input, salt);  give some temporary salt value in next line
    var hashedString = hash(req.params.input, this-is-some-random-string);
   res.send(hashedString);
    
})

app.get('/create-user', function(req, res){
   //this fn will take the  usernaem & password and create an entry in the user table
   var salt = crypto.geRandomBytes(128).toString('hex');
   var dbString = hash(password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1,$2)' [username, dbString], function (err, result){
     if (err) {
         res.status(500).send(err.toString());
     } 
     
   }
   
})
// pool connection - to fill

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
