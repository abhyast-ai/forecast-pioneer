const mongoose = require('mongoose');

// Define Schemas
const ColumnSchema = new mongoose.Schema({
  label: String,
  field: String, 
  filter: Boolean,
  editable: Boolean,
});

const Column = mongoose.model('Column', ColumnSchema);

// Row schema represents the rows in the grid
const RowSchema = new mongoose.Schema({
  // Modify 'fields' structure as needed based on actual field types
  fields: { type: Map, of: mongoose.Schema.Types.Mixed },
});

const Row = mongoose.model('Row', RowSchema);

module.exports = { Column, Row };
