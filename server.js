var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
  host: 'db.imad.hasura-app.io',
  user: 'sgovindan53',
  database: 'sgovindan53',
  port: '5432',
  password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}
}));

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


// now to do the login (Time 21.20). This is also a Post request becos it is going to use the same arguments user name & password  
// but instead of inserting it into the bdatabase, it will check the value from the database and see whether it is matching
app.post('/login', function (req, res){
   var username = req.body.username;
   var password = req.body.password;  
   pool.query('SELECT * FROM "user" WHERE username = $1' [username], function (err, result){
     if (err) {
         res.status(500).send(err.toString());
     } 
     else{
         if(result.rows.length===0){
             res.send(403).send("Username/password is invalid");
         }
         else{
         //match the password
         var dbString = result.rows[0].password;
         var salt = dbString.split($)[2];  //i.e.the 3rd item in the array ['pbkdf2', '10000', salt, hashed.toString('hex')].join('$');
         var hashedPassword = hash(password, salt); //here we are creating a hash based on the password submitted and teh original salt
         if hashedPassword === dbString{
           
           // SET A SESSION USING COOKIES. for this we use the express session library; 
             // ADD var session = require('express-session'); this has to be set before the login response
             
             req.session.auth = {userId: result.rows[0].id};
             
            // set cookie with a session id - that it is randomly generating by itself.
            //Internally, on the server side, it maps the session id to an object . .
            // This object contains a value called auth (auth: user Id)
            // The line 'req.session. . .' ensures that the session id (user id) is saved internally . .
            // on the server side before the "Credentials correct" response is sent.
            
             res.send("Credentials correct");
             
             
         } else{
            res.send(403).send("Username/password is invalid"); 
         }
     }
   });
   
});  

// to test whether the session id has been created . . 
app.check('/check-login', function (req, res) {
    if(req.session && req.session.auth && req.session.auth.userId) {
        res.send('You are logged in: ' + req.session.auth.userId.toString());
    } else {
        res.send('You are not logged in!');
    }
});

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
