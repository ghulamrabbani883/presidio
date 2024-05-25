const express = require("express");
const cors = require('cors');
const userRoute = require("./routes/userRoute.js");
const postRoute = require("./routes/postRoute.js");
require("dotenv").config({ path: "./.env" });
require('./config/db.js')

const app = express();
const port = process.env.PORT;

// Using middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

app.get("/", (req, res) => {
  return res.send("Hello from Presidio challenge");
});

// Using Routes
app.use('/user', userRoute)
app.use('/property', postRoute)

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
