var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');

var config = {
  host: 'db.imad.hasura-app.io',
  user: 'sgovindan53',
  database: 'sgovindan53',
  port: '5432',
  password: process.env.DB_PASSWORD
}

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input, salt) {
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, sha512);
    //return hashed.toString('hex');
    return['pbkdf2', '10000', salt, hashed.toString('hex')].join('$');
}
app.get('/hash/:input', function(req,res){
   // var hashedString = hash(req.params.input, salt);  give some temporary salt value in next line
   var hashedString = hash(req.params.input, this-is-some-random-string);
   res.send(hashedString);
    
})


var pool = new Pool(config);
//create a 'user' table with columns id, username, password
//app.get('/create-user', function (req, res) { // this is converted to a post request (see comments @ 14 to 15). . .
// . . assuming that we will get the username and password from the request body
//this fn will take the  username & password and create an entry in the user table
   
  app.post('/create-user', function (req, res) {
  // Q: how to make a post request . . see @ 16.10 . .
   var username = req.body.username;
   var password = req.body.password;
  // Q: where is this data coming in the req.body & what is the format of the data that is coming in . . 
  //. . we are going to assume t\hat this is a JSON request. If so we will have to tell the express framework . . 
  // . . to look for these keys (username, password) in the request body . .& that these are JSON . . .
  // . . for this we have to use the 'body parser' . . suitale code for this is added . . var bodyParser & in the app.use lines . .
  // . . see @ 16 . .
   var salt = crypto.randomBytes(128).toString('hex');  // 'getRandomByes' function is used to create the salt
   var dbString = hash(password, salt);
   pool.query('INSERT INTO "user" (username, password) VALUES ($1,$2)' [username, dbString], function (err, result){
     if (err) {
         res.status(500).send(err.toString());
     } 
     else{
         res.send('User successfully created: ' +username);
     }
   });
   
});
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
