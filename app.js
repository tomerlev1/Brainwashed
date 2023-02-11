// import modules
import http from "http";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import _ from "lodash";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as mongoose from 'mongoose';


const app = express();
const server = http.createServer(app);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Mongodb connection
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/blogDB', {useNewUrlParser: true});

const usersSchema = new mongoose.Schema({
  _id: Number,
  emailAdress: String,
  userPassword: String,
  userPosts: [{
    postTitle: String,
    postAuthor: String,
    postContent: String,
  }]
});

// const po


// Global variables
const posts = [];

// Global contents
const aboutPContent = "Hey !<br> My name as you can see at the footer of the page is Tomer Levin and I'm a programmer.<br> I create this blog for you to could be saved your daily story (as well to be able follow on your progress in your life tasks).<br> I hope you'll enjoy my website that I've worked on it in my free time. 🍊🍊";
const contactPContent = "Hello friends!<br> I'm glad you came to contact me.<br> I am available and attentive to any request or question you may have.<br> Please contact me in one of the following ways.";


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/javascript")));


app.get("/", function(req, res) {
  res.render("home", {listPosts: posts});
});

app.get("/myposts", function(req, res) {
  res.render("myposts", {listPosts: posts});
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


app.post("/publish", function(req, res) {
  const date = new Date();
  var current_time = date.getDate()+"/"+(date.getMonth()+1)+"/"+ date.getFullYear() +', '+ date.getHours()+ ":" + date.getMinutes()+":"+ date.getSeconds();

  const post = {
    title: req.body.composeTitle,
    content: req.body.composeBody,
    date: current_time,
  }
  posts.push(post);

  res.redirect("/myposts");
});

app.post("/compose", function(req, res) {
  res.redirect("compose");
});

app.get("/posts/:postName", function(req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);

  posts.forEach(function(post) {
    const storedTitle = _.lowerCase(post.title);

    if (storedTitle === requestedTitle) {
      res.render("post", {title: post.title, content: post.content, date: post.date});
    };
  });
});











server.listen(3000, function() {
  console.log('server runs on port 3000');
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