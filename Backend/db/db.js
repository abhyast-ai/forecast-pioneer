///importing mongoose 
const mongoose = require("mongoose");
/**
 * MongoDb Configuration
 */
const username = "mightguy001";
const password = "LXoVIWSC5oAnaVuQ";
const cluster = "cluster0.3eqferw";
const dbname = "NGTPrototype";

// Connect to MongoDB database
mongoose.connect(
    `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
  );

// Make sure db connection is successful
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", async function () {
  console.log("Connected successfully");
});

// Handle database connection error
db.on("error", (error) => {
  console.error("Database connection error:", error);
});
