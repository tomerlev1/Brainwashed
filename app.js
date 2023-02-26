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
// import { hashPassword, comparePassword } from "./javascript/bcrypt.js";


const app = express();
const server = http.createServer(app);
const __dirname = dirname(fileURLToPath(import.meta.url));


// Global variables

const users = {};

// Global contents
const aboutPContent = "Hey !<br> My name as you can see at the footer of the page is Tomer Levin and I'm a programmer.<br> I create this blog for you to could be saved your daily story (as well to be able follow on your progress in your life tasks).<br> I hope you'll enjoy my website that I've worked on it in my free time. 🍊🍊";
const contactPContent = "Welcome to my website!<br> I'm glad you came to contact me.<br> I am available and attentive to any request or question you may have.<br> Please contact me in one of the following ways.";


app.set('view engine', 'ejs');

app.use(
  session({
      name: 'SESSION_ID',      // cookie name stored in the web browser
      secret: '3 brothers',     // helps to protect session
      cookie: {
          maxAge: 30 * 86400000, // 30 * (24 * 60 * 60 * 1000) = 30 * 86400000 => session is stored 30 days
      }
  })
);



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/javascript")));





app.get("/", async function(req, res) {

  try 
  {
    const globalPosts = await Post.findGlobals().then((docs) => {return docs}).catch((err) => {return err});
    
    // const postAhutor =  await User.findById(await globalPosts.userId, function (err, docs) {
    //   if (err){
    //       console.log(err);
    //   }
    //   else{
    //       return(docs);
    //   }
    // });
    // console.log(postAhutor);
    // postAuthor: postAhutor.fullName
    // console.log(globalPosts);
    res.render("home", {listPosts: globalPosts});
  } 
  catch(e) 
  {
    console.log(e);
  }
});

app.get("/myposts", async function(req, res) {
  const userId = req.session.userId;
  try 
  {
    const userPosts = await Post.findUserPosts(userId).then((docs) => {return docs}).catch((err) => {return err});
    res.render("myposts", {listPosts: userPosts});
  } 
  catch(e) 
  {
    console.log(e);
  }
});

app.get("/about", function(req, res) {
  res.render("about", {aboutContent: aboutPContent});
});

app.get("/contact", function(req, res) {
  res.render("contact", {contactContent: contactPContent});
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.get("/signup", function(req, res) {
  res.render("signup");
});

app.get("/signin", function(req, res) {
  res.render("signin");
});

// Open the full post in his specific url
app.get("/posts/:postName", async function(req, res) {
  console.log(req.params.postName)
  const requestedPost = await Post.findPostByTitle(req.params.postName).then((docs) => {return docs}).catch((err) => {return err});

  if (requestedPost) {
      res.render("post", {title: requestedPost.title, content: requestedPost.content, date: requestedPost.createdAt});
    };
});

app.get("/userprofile/:userid", async function(req, res) {
  const requestedUser = req.params.userid;

  const cuurentUser = await User.findById(requestedUser, function (err, docs) {
    if (err){
        console.log(err);
    }
    else{
        return docs;
    }
  });

  res.render("userProfile", {fullName: cuurentUser.fullName});

});

app.get('/signout', function (req, res) {
  if (req.session.userId) {
      delete req.session.userId;
      res.redirect('/signin');
  } else {
      res.json({result: 'ERROR', message: 'User is not sign in.'});
  }
});

//PUBLISH A NEW POST 
app.post("/publish", async function(req, res) {

  const userPost = {
    userId: req.session.userId,
    title: req.body.composeTitle,
    content: req.body.composeBody,
    category: req.body.category[0],
  };

  console.log(userPost);

  if (userPost.userId) {
    try {
      await Post.insertPost(userPost).then((docs) => {return docs}).catch((err) => {return err})
    } catch(e) {
      console.log(e);
    };
  } else {
    console.log('You are not loged in !')
  }

  res.redirect("/myposts");
});

app.post("/compose", function(req, res) {
  res.redirect("compose");
});

// Signup new user
app.post("/signup", async function(req, res) {

  // Finding if email exist in users DB
  const foundEmail = await User.findByEmail(req.body.signupEmail).then((docs) => {return docs}).catch((err) => {return err});
  console.log(foundEmail);

  // Checking if email already exist
  if (String(foundEmail) === String([])) {
    try {
    await User.insertUser(req.body.fullName, req.body.signupEmail, req.body.password).then((docs) => console.log('Insertion was succeed')).catch((err) => console.log('Error while trying to insert new user'));

    users[req.body.signupEmail] = req.body.password;
    console.log(users);
    res.redirect("/signin");
    } catch(e) {
      console.log(e);
    };
  } else {
    console.log("Email is already exists");
    res.redirect("/signup");
  };
});

// Sign in to an existing user
app.post('/signin', async function(req, res) {
  if (req.session.userId) {
      res.json({result: 'ERROR', message: 'User already logged in.'});
  } else {
      try {
          const foundUser = await User.findByEmail(req.body.signinEmail).then((docs) => {return docs}).catch((err) => {return err});

          if (foundUser.length > 0) {
              const currentUser = foundUser[0];

              req.session.userId = currentUser._id;

              console.log('User login operation success.');
          } else {
              res.json({result: 'ERROR', message: 'Indicated username or/and password are not correct.'});
          };
      } catch(e) {
          console.error(e);
          res.json({result: 'ERROR', message: 'Request operation error.'});
      };
  res.redirect('/myposts');
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
//HTTPS TRYING
// const PORT = process.env.PORT || 4000;
// https.createServer(options, app).listen(PORT, console.log(`server runs on port ${PORT}`));



// db.products.insertOne({_id: 2, name: "tomer", price: 2, stock: 4.5, reviews: {
//   authorName: "john",
//   rating: 3, 
//   review: "LOL"
// }})

// db.products.deleteOne({name: "tomer"})