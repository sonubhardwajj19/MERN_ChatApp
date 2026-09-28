import express from "express";
import dotenv from "dotenv";
import mongoose  from "mongoose";
import User from "./models/User.js";
import Message from "./models/Message.js";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import {WebSocketServer} from "ws";


dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

mongoose.connect(process.env.MONGO_URL)
const jwtSecret = process.env.JWT_SECRET;

const bcryptSalt = bcrypt.genSaltSync(10);


app.post('/register' , async (req,res) => {
    const {username , password} = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password,bcryptSalt)
        const createdUser = await User.create({username,password:hashedPassword});
        jwt.sign({userId:createdUser._id,username}, jwtSecret, (err,token) => {
            if(err) throw err;
            res.cookie('token',token , {sameSite:'none' , secure:true}).status(201).json({
                id : createdUser._id
            });
        })
    } catch (err){
        if(err)  throw err;
    }
})


app.post('/login', async (req,res)  => {
    const {username,password} = req.body;
    const foundUser = await User.findOne({username});
    if(foundUser){
        const passOk = bcrypt.compareSync(password,foundUser.password);
       if(passOk){
          jwt.sign({userId:foundUser._id,username}, jwtSecret ,{}, (err,token) => {
             if (err) throw err;
             res.cookie('token',token,{sameSite:'none', secure:true}).json({
                id:foundUser._id
             })
          })
       }
    }
})


async function getUserDataFromRequest(req) {

    return new Promise((resolve,reject)=>{
        const token= req.cookies?.token;
        if(token) {
        jwt.verify(token,jwtSecret , (err, userData) => {
            if(err) throw err;
            resolve(userData);
        })
        } else {
            reject('No token found');
        }
    })
}

app.get('/profile', (req,res) => {
  const token= req.cookies?.token;
  if(token) {
      jwt.verify(token,jwtSecret , (err, userData) => {
          if(err) throw err;
          res.status(201).json(userData);
      })
  } else {
    res.status(401).json('No token');
  }

})


app.get('/messages:userId',async (req,res)=>{
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;

    const messages = await Message.find({
        sender:{$in:[userId,ourUserId]} ,
        recipient:{$in:[userId,ourUserId]} 
    });

    res.json(messages);


})

const server = app.listen(4000);

const wss = new WebSocketServer({server});

wss.on('connection', (connection,req)=>{

    const cookies = req.headers.cookie;
    if(cookies){
        const tokenCookieString = cookies.split(';').find(string => string.startsWith('token='));
     if(tokenCookieString) {
          const token = tokenCookieString.split('=')[1];
          if (token){
              jwt.verify(token,jwtSecret,{},(err,userData)=>{
               if(err) throw err;
               const {userId,username} = userData;
               connection.userId = userId;
               connection.username = username;
            })
          }
      }
    }

    // notify everyone when some new user connects

    [...wss.clients]
    .forEach(client => {
        client.send(JSON.stringify({
            online:  [...wss.clients]
            .map( c => ({userId:c.userId , username:c.username}))
        }))
    })


    connection.on('message', async (message)=> {
    const messageData = JSON.parse(message.toString());
    const {recipient,text} = messageData;

    // we are using userId jo message object mai aayi thi => usssai pehle reciever ko find kr rhe hain
    // and then use text send kr rhe 

    if (recipient && text) {
        const messageDoc = await Message.create({
            sender:connection.userId,
            recipient,
            text
        });

        [...wss.clients]
        .filter(c => c.userId === recipient)
        .forEach(c => c.send(JSON.stringify({
            sender:connection.userId,
            recipient,
            text,
            id:messageDoc._id
        }))); 
    }
    
    });
  
 
})