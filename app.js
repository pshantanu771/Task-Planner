const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//For encrypting the password
const bcrypt = require("bcrypt");
const saltRounds = 10


const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
const  ejs = require('ejs');
app.set('view engine', 'ejs');

app.use(express.static(__dirname+"/public"));

//Code for session and cookies
app.use(cookieParser());
app.use(session({
    secret: "This is my secret key",
    resave:false,
    saveUninitialized:false
  }
));




//Importing mongoose
const mongoose = require('mongoose');

// Connect MongoDB at default port 27017.
// mongoose.connect('mongodb://localhost:27017/todoUsers', {useNewUrlParser: true});
mongoose.connect('mongodb+srv://admin-shantanu:Test123@cluster0.hf1go.mongodb.net/todoUsers', {useNewUrlParser: true});

//Creating a schema for Signup
const signupSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    routineItems:[String]
});

//Creating a schema for contact form
const querySchema = new mongoose.Schema({
    name:String,
    email:String,
    query:String

})

// Creating a new collection for storing new user details
const signupDetails = mongoose.model("newuser",signupSchema);
const userQuery = mongoose.model("queries", querySchema);


let username = "";
let userEmailAddress;





//All get routes for signup and login

// GET request for our homepage
app.get("/",(req,res)=>{
    res.render("homepage.ejs");
})


// GET request for our contact page
app.get("/contact",(req,res)=>{
    res.render("contact.ejs")
})


// GET request for our about page
app.get("/about",(req,res)=>{
    res.render("about.ejs")
})

// POST request when user clicks on get started
app.post("/register", (req,res)=>{
    res.redirect("/showregister");
})

/* GET request for sign up page
We pass 'alreadyLoggedIn' middleware function here to check if the user already has an active session, if not it renders 'register.ejs'
*/
app.get("/showregister",alreadyLoggedIn, (req,res)=>{
    // console.log(req.session.user);
    res.render("register.ejs");
    
})

/* GET request for login page
We pass 'alreadyLoggedIn' middleware function here to check if the user already has an active session, if not it renders 'login.ejs'
*/
app.get("/showlogin", alreadyLoggedIn,(req,res)=>{
    res.render("login",{firstPara:""});
})


// All post routes

// 1. For sign up
app.post("/SignUp", (req,res)=>{

    //Getting entered details
    let email = req.body.email;
    let password = req.body.password;
    userEmailAddress = email;
    let signup_name = req.body.username;
    username = signup_name;

    // Add it to the collection

    //Using bcrypt method for hashing the passwords
    bcrypt.hash(password, saltRounds, (err,hash)=>{
        const User = new signupDetails({
            username:signup_name,
            email:email,
            // password:password,
            password:hash
            // routineItems:[]
        })
    
        // Saving the added data
        User.save();
    
        //Here we start our session with the details entered
        req.session.user = User;
    
        //Redirect to our working page
        res.redirect("/loggedIn");
    })
    
});

//Checking if the session is  started or not i.e if the user is already logged in
function alreadyLoggedIn(req,res,next) {
    //Here checking if session is started
    if(req.session.user){
        //This means it's started and user is logged in
        //So proceed to the resultant page
        // console.log("Session is started");
        res.redirect("/loggedIn");
    }
    else{
        //This means we have not signed in or logged in
        // console.log(res.session.user);

        // Proceed to the next route
        next()
    }
}


/*app.get("/loggedIn",alreadyLoggedIn , (req,res)=>{
    res.render("registeredPage.ejs");
})*/



//Now for the user to login
app.post("/Login", (req,res)=>{
    
    //Here we check if the user already has a account and if yes we redirect him to the 'registered page'

    // console.log("I'm here");

    // Collecting the login details
    const loginEmail = req.body.login_email;
    const loginPassword = req.body.login_password;
    
    let success = false;

    // Searching in the database
    signupDetails.find((err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            for(let i=0;i<data.length;i++){

                //First checking if the email is correct
                if(data[i].email==loginEmail){

                    //Comparing the passwords using bcrypt method which will automatically convert user entered password into hash
                    bcrypt.compare(loginPassword, data[i].password, (err,ok)=>{
                        if(ok==true){

                            //If matched redirecting to our main page

                            success = true;
                            // console.log("Login successful");
                            userEmailAddress = loginEmail;
                            username = data[i].username;
                            req.session.user = data[i];
                            res.redirect("/loggedIn"); 
                        }
                        else if(err){
                            console.log(err);
                        }
                        else if(ok!=true){

                            // Else rendering relogin page to try again

                            let message = "Invalid login credentials!! Try again"
                            res.render("login", {firstPara: message});
                        }
                    })
                    
                }
            }
            //Now if login fails then we render the login page with a message of Invalid credentials
            // if(success==false){
            //     let message = "Invalid login credentials!! Try again"
            //     res.render("login", {firstPara: message});
            // }
           
        }
    });
    
});


//Now to end the session if the user logouts
app.post("/logout", (req,res)=>{

    //Destroying the session
    req.session.destroy();

    //Redirecting the user back to the login page
    res.redirect("/showlogin");
})



//This is our page which user will see when he is signed in or logged in
app.get("/loggedIn", (req,res)=>{

    // Checking if the user has a active session then only allow user to the working page
    if(req.session.user){
        // console.log(username);

        //Displaying the available items in the array if any
        signupDetails.findOne({email:userEmailAddress}, (err,found)=>{
            if(err){
                console.log(err);
            }
            else{

                //If the array is empty redirecting user to other loggedIn page with empty list
                if(found.routineItems.length==0){
                    // console.log("Redirected to newloggedin");
                    res.redirect("/newloggedIn");
                }

                //Else rendering our page with the array items to display
                else{
                // console.log("Successfully retrievd array items");
                // console.log(found);
                // res.render("registeredPage.ejs", {dayName:found.username, addedItem:found});
                res.render("registeredPage.ejs", {dayName:found.username, addedItem:found.routineItems});
                }
            }
        })
    }

    // Elseredirect user to the login page
    else{
        res.redirect("/showlogin");
    }
})

// This is other loggedIn page if the array is empty initially
app.get("/newloggedIn", (req,res)=>{
    if(req.session.user){
        res.render("registeredPage.ejs", {dayName:username, addedItem:[]});
    }
    else{
        res.redirect("/showlogin");
    }
})


//Deleting the data from the array if user request delete
app.post("/delete", (req,res)=>{
    const del = req.body.deleteItem;
    signupDetails.findOneAndUpdate({
        email:userEmailAddress,
    },{
        $pull:{
            routineItems:del
        }
    }, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            // console.log("deleted successfully");
            res.redirect("/loggedIn");
        }
    })
})



// Adding new item to the array
app.post("/addNewItem", (req,res)=>{
    const retrievedValue = req.body.newItem;

    //Adding the item to the array in mongoose schema
    signupDetails.findOneAndUpdate({
        //Filter
        email:userEmailAddress,
    }, {
        $addToSet:{
            routineItems:retrievedValue,
        }
    }, (err)=>{
        if(err){
            console.log(err);
        }
        // else{
        //     console.log("Added successfully");
        // }
    });
    res.redirect("/loggedIn");
})


//If user wants to contact us
app.post("/contact", (req,res)=>{

    let name = req.body.contactName;
    let email = req.body.contactEmail;
    let query = req.body.contactQuery;
    const contact = new userQuery({
        name:name,
        email:email,
        query:query
    });
    contact.save();
    // res.redirect("/contact")
})


//Resetting the array if user clicks
app.post("/resetAll", (req,res)=>{
    signupDetails.updateOne({email:userEmailAddress}, {
        $set : {
            routineItems:[]
        }
    }, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            // console.log("Deleted all");
            res.redirect("/loggedIn");
        }
    })
})


//Starting the port
app.listen(process.env.PORT || 80,(req,res)=>{
    console.log("Sever started on port 80");
})