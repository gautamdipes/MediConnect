require('dotenv').config(); 
const mongoose = require('mongoose'); 

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediconnect').then(async () => { 
  const db = mongoose.connection.db; 
  const bir = await db.collection('hospitals').findOne({hospitalName: 'Bir Hospital'}); 
  if(bir) { 
    await db.collection('users').updateOne({email: 'bir123@gmail.com'}, { $set: {hospitalId: bir._id} }); 
    console.log('Linked bir123@gmail.com to Bir Hospital'); 
  } 
  process.exit(0); 
}).catch(console.error);
