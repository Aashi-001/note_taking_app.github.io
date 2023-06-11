const express = require('express')
const mongoose = require('mongoose')
const Note = require('./models/notes')
const User = require('./models/user')
const CryptoJS = require('crypto-js');
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
app.get('/home', (req, res) => {
  res.sendFile("pages/home.html", {root: __dirname})
})
app.get('/login', (req, res) => {
    res.sendFile("pages/login.html", {root: __dirname})
  })
app.get('/logout', (req, res) => {
    res.sendFile("pages/logout.html", {root: __dirname})
  })
app.get('/signup', (req, res) => {
    res.sendFile("pages/signup.html", {root: __dirname})
  })
app.get('/newnote', (req, res) => {
    res.sendFile("pages/newnote.html", {root: __dirname})
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

app.get('/getnote/:objectId', (req, res) => {
    const { objectId } = req.params;
  
    // Check if the provided objectId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      res.status(400).json({ error: 'Invalid objectId.' });
      return;
    }
  
    // Find the note by the provided objectId
    Note.findById(objectId)
      .then(foundNote => {
        if (!foundNote) {
          console.log('Note not found.');
          res.status(404).json({ error: 'Note not found.' });
          return;
        }
  
        // Return the found note
        res.status(200).json({ note: foundNote.note });
      })
      .catch(err => {
        console.error('Error fetching note:', err);
        res.status(500).json({ error: 'An error occurred while fetching the note.' });
      });
  });

app.post('/editnote', (req, res) => {
  const { objectId, note } = req.body;

  // Check if the provided objectId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(objectId)) {
    res.status(400).json({ error: 'Invalid objectId.' });
    return;
  }

  // Find the note by the provided objectId
  Note.findById(objectId)
    .then(foundNote => {
      if (!foundNote) {
        console.log('Note not found.');
        res.status(404).json({ error: 'Note not found.' });
        return Promise.reject(); // Reject the promise chain to skip to the catch block
      }

      // Append the new note to the existing note
      foundNote.note = note;

      // Save the updated note
      return foundNote.save();
    })
    .then(updatedNote => {
      console.log('Updated note:', updatedNote.note);
      res.status(200).json({ message: 'Note updated successfully.', note: updatedNote });
    })
    .catch(err => {
      console.error('Error updating note:', err);
      res.status(500).json({ error: 'An error occurred while updating the note.' });
    });
});


// ...

  
  

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  
  if (!user) {
    res.status(200).json({ success: false, message: "No user found" });
  } else {
    // Compare the hashed password with the provided password
    const hashedPassword = CryptoJS.SHA256(password).toString();
    
    if (hashedPassword === user.password) {
      res.status(200).json({ success: true, user: { email: user.email }, message: "User found" });
    } else {
      res.status(200).json({ success: false, message: "Invalid password" });
    }
  }
});

  app.post('/logout', async(req, res) => {
    // Perform any necessary logout actions here
    // This could include clearing the user token or any session-related data
    const {userToken} = req.body
    let user = await User.findOne(req.body)
    // console.log(user)
    
    // console.log(user)
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
  

app.post('/signup', async(req, res) => {
    const {email, password} = req.body
    console.log(req.body)

    const hashedPassword = CryptoJS.SHA256(password).toString();

    let user = await User.create({ email, password: hashedPassword });
    res.status(200).json({success:true, user: user})
  })

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})