//submit username, password to login
var submit = document.getElementById("submit_btn");
submit.onclick = function() {
    
    var request = new XMLHttpRequest();
    
    //capture the response and store it in our variable
    request.onreadystatechange = function () {
       if (request.readyState === XMLHttpRequest.DONE) {
         //TAKE SOME ACTION
        if (request.status ===200) {
        console.log("User logged in");
        alert("Logged in successfully");
       } else if (request.status===403) {
           alert("Username/password is incorrect");
        } else if (request.status===500) {
            alert("Something went wrong on the server!");
        }
       }
    };
   // Make the request 
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  console.log("username");
  console.log("password");
  request.open('POST', 'http://sgovindan53.imad.hasura-app.io/login', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({username: username, password: password}));
                
};
