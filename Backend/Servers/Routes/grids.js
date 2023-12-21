const express = require("express");
const { Column, Row } = require("../../models/grid"); // Importing models from Grid.js

const router = express.Router();

// Add Column
router.post("/addColumn", async (req, res) => {
  try {
    const { label, field, filter, editable } = req.body;
    const newColumn = new Column({ label, field, filter, editable });
    await newColumn.save();
    res.status(201).send("Column added successfully");
  } catch (error) {
    res.status(500).send("Error adding column");
  }
});

// Add Row
router.post("/addRow", async (req, res) => {
  try {
    const rowData = req.body;
    const newRow = new Row({ fields: rowData });
    await newRow.save();
    res.status(201).send("Row added successfully");
  } catch (error) {
    res.status(500).send("Error adding row");
  }
});

// Edit Column
router.put("/editColumn/:id", async (req, res) => {
  try {
    const { label, field, filter, editable } = req.body;
    const updatedColumn = await Column.findByIdAndUpdate(
      req.params.id,
      { label, field, filter, editable },
      { new: true }
    );
    res.status(200).json(updatedColumn);
  } catch (error) {
    res.status(500).send("Error updating column");
  }
});

// Delete Column
router.delete("/deleteColumn/:id", async (req, res) => {
  try {
    await Column.findByIdAndDelete(req.params.id);
    res.status(200).send("Column deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting column");
  }
});

// Get Columns
router.get("/getColumns", async (req, res) => {
  try {
    const columns = await Column.find({});
    res.status(200).json(columns);
  } catch (error) {
    res.status(500).send("Error fetching columns");
  }
});

// Get Rows
router.get("/getRows", async (req, res) => {
  try {
    const rows = await Row.find({});
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).send("Error fetching rows");
  }
});

// Edit Row
router.put("/editRow/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRowData = req.body;
    await Row.findByIdAndUpdate(id, { fields: updatedRowData });
    res.status(200).send("Row updated successfully");
  } catch (error) {
    res.status(500).send("Error updating row");
  }
});

// Delete Row
router.delete("/deleteRow/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Row.findByIdAndDelete(id);
    res.status(200).send("Row deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting row");
  }
});

module.exports = router;
