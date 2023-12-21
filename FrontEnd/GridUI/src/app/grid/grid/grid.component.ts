import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ColDef, GridApi } from 'ag-grid-community';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
})
export class GridComponent implements OnInit {
  gridApi!: GridApi;
  columnDefs: any[] = [];
  rowData: any[] = [];
  themeClass = 'ag-theme-quartz-dark';
  newColumnLabel: string = '';
  // Properties for capturing user input
  editIndex: number = 0;
  deleteIndex: number = 0;
  newLabel: string = '';


  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridApi.setGridOption('columnDefs', this.columnDefs);
    this.gridApi.setGridOption('rowData', this.rowData);
  }

  ngOnInit(): void {
    // Initialize column definitions with default settings
    this.columnDefs = [];
    this.rowData = [];
  }
  // Function to add columns dynamically based on user input
  addColumn(columnLabel: string): void {
    const newColDef: any = {
      headerName: columnLabel,
      field: columnLabel.toLowerCase(),
      filter: 'agTextColumnFilter', // Enable text filter for this column
      editable: true, // Allow editing in this column
    };
    this.columnDefs.push(newColDef);
    this.gridApi.setGridOption('columnDefs', this.columnDefs); // Update columnDefs directly
    this.newColumnLabel = '';
    // If rowData is empty, initialize it with an empty object for the added column
    if (this.rowData.length === 0) {
      this.rowData.push({ [newColDef.field]: '' });
    } else {
      // Add the new field to existing row objects
      this.rowData.forEach((row) => {
        row[newColDef.field] = '';
      });
    }

    this.gridApi.setGridOption('rowData', this.rowData);
  }
  
  // Function to add a new row to the rowData
  addRow(): void {
    const newRow: any = {};
    this.columnDefs.forEach((colDef) => {
      newRow[colDef.field] = '';
    });
    this.rowData.push(newRow);
    this.gridApi.setRowData(this.rowData);
  }

  //Function to edit the labels
  editColumnLabel(index: number, newLabel: string): void {
    if (index >= 0 && index < this.columnDefs.length) {
      const field = this.columnDefs[index].field;
      if (field !== undefined) {
        this.columnDefs[index].headerName = newLabel;
        this.gridApi.setGridOption('columnDefs', this.columnDefs);

        // Update the row data keys if the field name changes
        this.rowData.forEach((row) => {
          if (row.hasOwnProperty(field)) {
            row[newLabel] = row[field];
            delete row[field];
          }
        });
        this.gridApi.setGridOption('rowData', this.rowData);
      }
    }
  }

  //Function to delete the columns
  deleteColumn(index: number): void {
    if (index >= 0 && index < this.columnDefs.length) {
      const field = this.columnDefs[index].field;
      if (field !== undefined) {
        this.columnDefs.splice(index, 1);
        this.gridApi.setGridOption('columnDefs', this.columnDefs);

        // Remove the field from row data
        this.rowData.forEach((row) => {
          delete row[field];
        });
        this.gridApi.setRowData(this.rowData);
      }
    }
  }

  // Method to save and print values
  onSave(): void {
    console.log('Column Definitions:', this.columnDefs);
    console.log('Row Data:', this.rowData);
  }
}
