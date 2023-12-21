const express = require("express");
const session = require('express-session');
const cors=require('cors');
const gridsRouter= require('./Servers/Routes/grids')
const app = express();

// Enable CORS for all routes
app.use(cors());

// Configure session middleware
app.use(
    session({
      secret: 'very-secret-key', 
      resave: false,
      saveUninitialized: true,
    })
  );

app.use(express.json());

/// run the db connection
require("./db/db");

///set up middleware for parsing data from client side
app.use(express.urlencoded({ extended: true })); ///seting the url automation
app.use(express.json()); ///to accept json format in data

///Provide a port number for the server to start
const port = 4000 || process.env.PORT;

///for importing the router module
///setting up routes
app.use('/',gridsRouter);


//allowing the server to start on the particular port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
