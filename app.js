// import modules
import http from "http";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import _ from "lodash";
import session from "express-session";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { User, Post } from "./javascript/schemas.js";
import {comparePassword } from "./javascript/bcrypt.js";
// import https from "https";
// import fs from "fs";



const app = express();
const server = http.createServer(app);
const __dirname = dirname(fileURLToPath(import.meta.url));



// Global contents
const aboutPContent = "Hey !<br> My name as you can see at the footer of the page is Tomer Levin and I'm a developer.<br> I create this blog for people who want to share their stories or daily adventures with the world.<br> as well you can save your stories private for your own uses.<br> I hope you'll enjoy my website that I've worked on in my free time. 🧠🧠";
const contactPContent = "Welcome to my website!<br> I'm glad you came to contact me.<br> I am available and attentive to any request or question you may have.<br> Please contact me in one of the following ways.";


// Function to make "home rendering" nice looking
async function homeRender(res, req, error = null) {
  try 
  {
    const globalPosts = await Post.findGlobals().then((docs) => {return docs}).catch((err) => {return err});

    const globalAhutors = []
    for (let i = 0; i < globalPosts.length; i++) {
      let postAhutor =  await User.findById(globalPosts[i].userId, function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            return(docs);
        }
      });
      globalAhutors.push(postAhutor[0].fullName)
    };

    res.render("home", {message: error, listPosts: globalPosts, listAhutors: globalAhutors, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
  } 
  catch(e) 
  {
    console.log(e);
  };
};

async function currentUser(req) {
  const curUser = await User.findById(req.session.userId, function (err, docs) {
    if (err){
        console.log(err);
    }
    else{
        return docs;
    }
  });
  return curUser[0]
};

async function userPosts(req) {

  const userId = req.session.userId;
  const userPosts = await Post.findUserPosts(userId).then((docs) => {return docs}).catch((err) => {return err});

  return userPosts;
}

app.set('view engine', 'ejs');

app.use(
  session({
      name: 'SESSION_ID',      // cookie name stored in the web browser
      secret: '3 brothers',     // helps to protect session
      resave: true,
      saveUninitialized: true,
      cookie: {
          maxAge: 30 * 86400000, // 30 * (24 * 60 * 60 * 1000) = 30 * 86400000 => session is stored 30 days
      }
  })
);



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/javascript")));





app.get("/", async function(req, res) {
  homeRender(res, req);
});

app.get("/myposts", async function(req, res) {
  const userId = req.session.userId;
  try 
  {
    const userPosts = await Post.findUserPosts(userId).then((docs) => {return docs}).catch((err) => {return err});
    res.render("myposts", {message: null, listPosts: userPosts, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
  } 
  catch(e) 
  {
    console.log(e);
  };
});

app.get("/about", async function(req, res) {
  res.render("about", {aboutContent: aboutPContent, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
});

app.get("/contact", async function(req, res) {
  res.render("contact", {contactContent: contactPContent, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
});

app.get("/compose", async function(req, res) {
  res.render("compose", {message: null, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
});

app.get("/signup", async function(req, res) {
  res.render("signup", {message: null, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
});

app.get("/signin", async function(req, res) {
  res.render("signin", {message: null, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
});

// Open the full post in his specific url
app.get("/posts/:postId", async function(req, res) {

  const requestedPost = await Post.findPostById(req.params.postId).then((docs) => {return docs[0]}).catch((err) => {return err});

  if (requestedPost) {
      res.render("post", {title: requestedPost.title, content: requestedPost.content, date: requestedPost.createdAt, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
    };
});

// Decided not to use this code ! ////////////////////////
// app.get("/userprofile/:userid", async function(req, res) {
//   const requestedUser = req.params.userid;

//   const cuurentUser = await User.findById(requestedUser, function (err, docs) {
//     if (err){
//         console.log(err);
//     }
//     else{
//         return docs;
//     }
//   });

//   res.render("userProfile", {fullName: cuurentUser.fullName, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});

// });

app.get('/logout', function (req, res) {
  if (req.session.userId) {
      delete req.session.userId;
      res.redirect('/');
  } else {
      res.json({result: 'ERROR', message: 'User is not sign in.'});
  }
});

app.get('*', (req, res) => {
  res.redirect('/')
})

//PUBLISH A NEW POST 
app.post("/publish", async function(req, res) {

  const userPost = {
    userId: req.session.userId,
    title: req.body.composeTitle.toLowerCase(),
    content: req.body.composeBody,
    category: req.body.category[0],
  };
  const foundTitle = await Post.findUserPosts(req.session.userId).then((docs) => {return docs}).catch((err) => {return err});
  try {
    const foundMatch = await foundTitle.find(element => element.title === req.body.composeTitle.toLowerCase());

    if (foundMatch != undefined) {
      res.render('compose', {message: '**This title already exsits, please choose another one**', user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
    }
    else if(userPost.userId) {
      try {
        await Post.insertPost(userPost).then((docs) => {return docs}).catch((err) => {return err})
        res.redirect("/myposts");
      } catch(e) {
        console.log(e);
      };
    } else {
      res.render('compose', {message: '**User must log in to post**', user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
    };
  } catch(error) {
    console.log(error);
  };
});

app.post("/compose", function(req, res) {
  res.redirect("compose");
});

app.post("/search", async function(req, res) {
  try {
      const requestedTitle = await Post.findPostByTitle(req.body.postTitle).then((docs) => {return docs}).catch((err) => {return err});

      const searchAhutors = []
      for (let i = 0; i < requestedTitle.length; i++) {
        let postAhutor =  await User.findById(requestedTitle[i].userId, function (err, docs) {
          if (err){
              console.log(err);
          }
          else{
              return(docs);
          }
        });

        searchAhutors.push(postAhutor[0].fullName);
      };
      if (requestedTitle.length >= 1) {
          res.render("home", {message: null, listPosts: requestedTitle, listAhutors: searchAhutors, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
      } else {
        throw Error;
      }
  } catch(e) {
    homeRender(res, req, '**Incorrect title**');
  }
});

// Signup new user
app.post("/signup", async function(req, res) {

  // Finding if email exist in users DB
    const foundEmail = await User.findByEmail(req.body.signupEmail).then((docs) => {return docs}).catch((err) => {return err});
    console.log(foundEmail);
  // Checking if email already exist
  if (String(foundEmail) === String([])) {
    try {
      const message = await User.insertUser(req.body.fullName, req.body.signupEmail, req.body.password).then((docs) => {return docs;}).catch((err) => console.log(err));
      console.log(message);

      res.render("signup", {message: `** ${message}**`, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
    } catch(e) {
      res.render("signup", {message: e, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
    };
  } else {
    res.render("signup", {message: '**Email address already exist.**', user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
  };
});

// Sign in to an existing user
app.post('/signin', async function(req, res) {

  if (req.session.userId) {
    res.render("signin", {message: '**You are already logged in**', user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
  } else {
      try {
          const userPassword = req.body.password;

          const foundUser = await User.findByEmail(req.body.signinEmail).then((docs) => {return docs}).catch((err) => {return err});
          
          if (foundUser.length > 0) {
            
              const loginUser = foundUser[0];
              const passwordsMatching = await comparePassword(userPassword, loginUser.userPassword).then((docs) => {return docs}).catch((err) => {return err});

              if (passwordsMatching) {
                req.session.userId = loginUser._id;
                console.log('User login operation success.');
                homeRender(res, req);
              } else {
                res.render("signin", {message: '**Incorrect password entered!**', user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
              }
          } else {
              res.render("signin", {message: '**Incorrect email address entered!**', user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
          };
      } catch(e) {
          console.error(e);
          res.render("signin", {message: '**Request operation error.**', user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
      };
  };
});

app.post('/delete', async function(req, res) {
    
    const curUser = req.session.userId;
    const postTitle = req.body.postTitle;

    try {
      const returnValue = await Post.deletePostByTitle(curUser, postTitle).then((result) => {return result}).catch((err) => {return err});
      console.log(returnValue);
      
      if (returnValue.deletedCount === 0) {
        const userPosts = await Post.findUserPosts(curUser).then((docs) => {return docs}).catch((err) => {return err});
        
        res.render("myposts", {message: '**An incorrect title was inputted**', listPosts: userPosts, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
      } else {

        const newListPosts = await Post.findUserPosts(curUser).then((docs) => {return docs}).catch((err) => {return err});

        res.render("myposts", {message: null, listPosts: newListPosts, user: await currentUser(req).then(result => {return result;}).catch(err => {return err;})});
      }
    } catch(e) {
      console.log(e);
    };
    
});








server.listen(3000, function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log('server runs on port 3000');
  }
});


// const options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };
// //HTTPS TRYING
// const PORT = process.env.PORT || 4000;
// https.createServer(options, app).listen(PORT, console.log(`server runs on port ${PORT}`));
