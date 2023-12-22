const mongoose = require("mongoose");

// Define Schemas
const ColumnSchema = new mongoose.Schema({
  // headerName: String,
  // field: String,
  // filter: String,
  // editable: Boolean,
}, { strict: false });

const Column = mongoose.model("Column", ColumnSchema);

// Row schema represents the rows in the grid
const RowSchema = new mongoose.Schema({
  // Define fields dynamically using the 'Mixed' type
}, { strict: false });


const Row = mongoose.model("Row", RowSchema);

module.exports = { Column, Row };
