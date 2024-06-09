import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

console.log('Connecting to database')
mongoose.connect(MONGODB_URI).then(()=>{
  console.log('Connection to the database successful')
}).catch(error=>{
  console.log(`Error connecting to database, error: ${error.message}`)
})
