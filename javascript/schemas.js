import mongoose from "mongoose";
import validator  from "validator";
import { hashPassword} from "./bcrypt.js";
import {ObjectId} from "mongodb";

var db_server  = process.env.DB_ENV || 'primary';

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/blogDB", {useNewUrlParser: true});

export const Schema = mongoose.Schema;
export const model = mongoose.model;

const PostSchema = new Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required:true
  },
  title: {
    type: String,
    required: true,
    max: 20
  },
  content: {
      type: String,
      required: true,
      max: 500
  },
  category: {
    type: String, 
    required: true
  },
  likes: {
      type: Array,
      default: []
  }
},
  { timestamps: true }
);


const UserSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Please enter Full Name"],
  },
  emailAddress: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, "Please enter Email Address"],
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not valid email",
      isAsync: false
    }
  },
  userPassword: {
    type: String,
    required: [true, "Please enter a password"],
    minLength: 6,
  }
  }
  , { timestamps: true }
);

// static method that insert new user 
UserSchema.static("insertUser",async function(Fname, email, password) {

  try {
    const hash = await hashPassword(password).then((result) => {return result}).catch((err) => {console.log('Error to hash the password')});

    const user = new this({
      fullName: Fname,
      emailAddress: email,
      userPassword: hash,
    });

    const message = await user.save().then(savedUser => {
      savedUser === user;
    })
    return 'User successfully created';
  } catch (error) {
    return error.errors.emailAddress.properties.message;
  };
});


// static method that find user by email 
UserSchema.static("findByEmail",async function(email) {

  const query = await this.find({emailAddress: {$eq: email}});
  query instanceof this.Query;
  const emailFound = await query;

  return emailFound;
});

UserSchema.static("findById",async function(userId) {

  const query = await this.find({_id: {$eq: userId}});
  query instanceof this.Query;
  const userFound = await query;

  return userFound;
});


// static method that delete user by id 
UserSchema.static("deleteById",async function(userId) {
  await this.deleteOne({_id: {$eq: userId}}, function(err, result) {
    if (err){
      console.log(err);
  }
  else{
      console.log(result)
  }
  });
});


// static method that insert new post 
PostSchema.static("insertPost",async function(userPost) {

    const Post = await new this (
      userPost
      );
    Post.save(function(err,result){
      if (err){
          console.log(err);
          return false;
      }
      else{
          console.log('Post insertion succeeded');
          return true;
      }
  });
});

PostSchema.static("findUserPosts",async function(id) {

  const query = await this.find({userId: {$eq: id}});
  query instanceof this.Query;
  const posts = await query;

  return posts;
});

PostSchema.static("findGlobals", async function() {

  const query = await this.find({category: {$eq: 'global'}});
  query instanceof this.Query;
  const posts = await query;

  return posts;
});

PostSchema.static("findPostByTitle", async function(title) {

  const query = await this.find({title: {$regex: title.toLowerCase(), $options: "i"}, category: {$eq: 'global'}});
  query instanceof this.Query;
  const postFound = await query;

  return postFound;
});

PostSchema.static("findPostById", async function(id) {

  const query = await this.find({_id: {$eq: id}, category: {$eq: 'global'}});
  query instanceof this.Query;
  const postFound = await query;
  console.log(postFound);
  return postFound;
});

PostSchema.static("deletePostByTitle", async function(userId, title) {
  const user_Id = ObjectId(userId);

  return await this.deleteOne({userId: {$eq: user_Id}, title: {$eq: title}});
});


export const User = model("User", UserSchema);
export const Post = model("Post", PostSchema);



const gracefulExit = function() { 
  mongoose.connection.close(function () {
    console.log('Mongoose default connection with DB :' + db_server + ' is disconnected through app termination');
    process.exit(0);
  });
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);
