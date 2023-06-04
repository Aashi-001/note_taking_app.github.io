const express = require('express')
const mongoose = require('mongoose')
const Note = require('./models/notes')
const User = require('./models/user')
const app = express()
app.use(express.json({extended: true}))
// app.use(express.urlencoded())
const port = 3000
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: false, // Don't build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
}
const uri = "mongodb+srv://aashi2673:BWWF7srICbowc7kF@cluster0.005xi8p.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, options)
  .then(()=>{
    console.log("Connected to MongoDB");
  })
  .catch((e)=> {
    console.log(e)
  });
var ObjectId = require('mongodb').ObjectId; 

app.get('/', (req, res) => {
  res.sendFile("pages/index.html", {root: __dirname})
})

app.get('/login', (req, res) => {
    res.sendFile("pages/login.html", {root: __dirname})
  })

app.get('/signup', (req, res) => {
    res.sendFile("pages/signup.html", {root: __dirname})
  })

app.get('/newnote', (req, res) => {
    res.sendFile("pages/newnote.html", {root: __dirname})
  })
app.get('/deletenode', (req, res) => {
    res.sendFile("pages/deletenode.html", {root: __dirname})
  })

app.post('/getnotes', async (req, res) => {
    const {user} = req.body
    let notes = await Note.find({email: req.body.email})
    res.status(200).json({success:true, notes})
  })

app.post('/addnote', async (req, res) => {
    const {user} = req.body
    console.log(req.body)
    let note = await Note.create(req.body)
    res.status(200).json({success:true, note: note})
  })

app.post('/deletenote', async function(req, res){
    const { objectId } = req.body;
    console.log('Received ObjectId:', objectId);
    Note.findOne({ _id: objectId })
    .then((doc) => {
      if (doc) {
        // Delete the document
        return Note.deleteOne({ _id: objectId });
      } else {
        console.log('Document not found');
        return null;
      }
    })
    .then((result) => {
      if (result) {
        console.log('Document deleted successfully');
      }
    })
    .catch((err) => {
      console.error('Error deleting document:', err);
    });
  })

app.post('/login', async (req, res) => {
    const {userToken} = req.body
    let user = await User.findOne(req.body)
    if(!user){
      res.status(200).json({success: false, message: "No user found"})
    }
    else{
      res.status(200).json({success: true, user: {email: user.email}, message:"User found"})
    }
    // res.sendFile("pages/newnote.html", {root: __dirname})
  })

app.post('/signup', async(req, res) => {
    const {userToken} = req.body
    console.log(req.body)
    let user = await User.create(req.body)
    res.status(200).json({success:true, user: user})
  })

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})