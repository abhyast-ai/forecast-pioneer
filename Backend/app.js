const express = require("express");
const session = require('express-session');

const app = express();

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
const port = 4000 || process.env.port;

///for importing the router module
const gridsRouter = require("./Servers/Routes/grids");

///setting up routes
app.use(gridsRouter);


//allowing the server to start on the particular port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
