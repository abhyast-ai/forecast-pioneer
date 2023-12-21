//importing mongoose
const mongoose = require("mongoose")
// schema represents the structure of a particular document
// Each schema maps to a MongoDB collection
const { Schema } = mongoose;

//Student schema
const gridSchema = new Schema({
  headerName:String,
  field:String, 
});

//exporting the model

module.exports = mongoose.model("Grid", gridSchema)