import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-datasheet',
  templateUrl: './datasheet.component.html',
  styleUrls: ['./datasheet.component.css'],
})
export class DatasheetComponent implements OnInit {
  dynamicForm: any;
  columnDef: any[] = [];
  rowData: any[] = [];

  constructor(private fb: FormBuilder, private toastr: ToastrService) {}

  /**
   * it will create a blank cell
   */
  ngOnInit() {
    this.dynamicForm = this.fb.group({
      rows: this.fb.array([this.createRow()]),
    });
  }

  /**
   * Creates a row with cells
   * @returns create a row having 'n' cells where n -> no. of columns
   */
  createRow(): FormGroup {
    const firstRow = this.fb.array([this.createCell()]);
    return this.fb.group({
      cells: firstRow,
    });
  }

  /**
   * Creates an empty cell
   * @returns a form control representing a cell
   */
  createCell(): FormControl {
    // Create a form control representing a cell
    return this.fb.control(''); // Create an empty cell
  }

  /**
   * Add a new cell to a row
   * @param row returns a form Array representing a row
   */
  addCell(row: FormGroup) {
    const cells = row.get('cells') as FormArray;
    cells.push(this.createCell());
  }

  /**
   * Adds a new row with the cells
   */
  addRow() {
    // Add a new row based on the number of cells in the first row
    const rows = this.dynamicForm.get('rows') as FormArray;
    const firstRowCells = (rows.at(0) as FormGroup).get('cells') as FormArray;
    const numOfColumns = firstRowCells.length;

    // Create a new row with the same number of cells as the first row
    const newRow = this.fb.group({
      cells: this.fb.array([]), // Initialize with an empty array
    });

    // Add the same number of cells as in the first row to the new row
    for (let i = 0; i < numOfColumns; i++) {
      (newRow.get('cells') as FormArray).push(this.createCell());
    }

    rows.push(newRow);
  }

  /**
   * it stores the data and saves it for csv download,
   */
  onSubmit() {
    const rows = this.dynamicForm.get('rows')?.value;
    // 'rows' contains the array of rows with each row having a 'cells' property
    (this.columnDef = []), (this.rowData = []);
    // Extracting 'cells' from the first row as column definition
    this.columnDef = rows[0]?.cells;

    // Looping through each row, excluding the first row, to gather cell data
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowValues = row?.cells;
      this.rowData.push(rowValues); // Appending cell values from each row (excluding the first row) to rowData using 'push'
    }
    this.toastr.success('Values have been saved!', 'Success');
  }

  /**
   * resets all the data
   */
  resetCells() {
    const rows = this.dynamicForm.get('rows') as FormArray;

    // Remove all rows except the first one
    while (rows.length > 1) {
      rows.removeAt(1);
    }

    // Clear the cells in the first row
    const firstRow = rows.at(0) as FormGroup;
    const cells = firstRow.get('cells') as FormArray;
    while (cells.length > 0) {
      cells.removeAt(0);
    }

    //  reset  related data or variables
    this.columnDef = [];
    this.rowData = [];

    // show a warning message
    this.toastr.warning('Cells have been reset!', 'Success');
  }

  /**
   * Evaluates a formula string to calculate a numerical result.
   * @param formula - The formula string to evaluate.
   * @returns The result of the formula as a number.
   */
  evaluateFormula(formula: string): number {
    // Split the formula into cell references
    const cellRefs = formula.split(',').map((ref) => ref.trim());

    let sum = 0;
    for (const cellRef of cellRefs) {
      // Check for a range of cells in the format "A1:B3"
      const rangeMatch = cellRef.match(/(\w\d+:\w\d+)/);
      if (rangeMatch) {
        const [startCell, endCell] = rangeMatch[0].split(':');
        const start = this.getCellCoordinates(startCell);
        const end = this.getCellCoordinates(endCell);

        // Loop through the range of cells
        for (let i = start.row - 1; i <= end.row - 1; i++) {
          for (let j = start.column; j <= end.column; j++) {
            // Get cell value from the dynamic form
            const rowFormGroup = this.dynamicForm
              .get('rows')
              ?.get(i.toString()) as FormGroup;
            if (rowFormGroup) {
              const cellValue = rowFormGroup
                .get('cells')
                ?.get(j.toString())?.value;
              // Add valid numeric cell values to the sum
              if (cellValue !== undefined && !isNaN(cellValue)) {
                sum += +cellValue;
              }
            }
          }
        }
      } else {
        // Handle a single cell reference
        const singleCell = cellRef.match(/(\w\d+)/);
        if (singleCell) {
          const [column, row] =
            singleCell[0].match(/([A-Za-z]+)(\d+)/)?.slice(1) || [];
          if (column && row) {
            // Convert cell coordinates to row and column indices
            const rowIndex = parseInt(row, 10) - 1;
            const columnIndex = column.charCodeAt(0) - 'A'.charCodeAt(0);

            // Retrieve cell value from the dynamic form
            const rowFormGroup = this.dynamicForm
              .get('rows')
              ?.get(rowIndex.toString()) as FormGroup;
            if (rowFormGroup) {
              const cellValue = rowFormGroup
                .get('cells')
                ?.get(columnIndex.toString())?.value;
              // Add valid numeric cell values to the sum
              if (cellValue !== undefined && !isNaN(cellValue)) {
                sum += +cellValue;
              }
            }
          }
        }
      }
    }

    return sum;
  }

  /**
   * Copies the assigned value to cells based on a given formula.
   * @param formula The formula containing cell references.
   * @param assignedValue The value to be assigned to cells.
   */
  copy(formula: string, assignedValue: number) {
    // Split the formula into individual cell references
    const cellRefs = formula.split(',').map((ref) => ref.trim());

    // Iterate through each cell reference
    for (const cellRef of cellRefs) {
      // Check if the reference represents a range of cells
      const rangeMatch = cellRef.match(/(\w\d+:\w\d+)/);
      if (rangeMatch) {
        // Extract start and end cells from the range
        const [startCell, endCell] = rangeMatch[0].split(':');
        const start = this.getCellCoordinates(startCell);
        const end = this.getCellCoordinates(endCell);

        // Iterate through the cells within the range
        for (let i = start.row; i <= end.row; i++) {
          for (let j = start.column; j <= end.column; j++) {
            // Get the form group representing the row and set the cell value
            const rowFormGroup = this.dynamicForm
              .get('rows')
              ?.get(i.toString()) as FormGroup;
            if (rowFormGroup) {
              const cell = rowFormGroup.get('cells')?.get(j.toString());
              cell?.setValue(assignedValue); // Assign the value to the cell
            }
          }
        }
      }
    }
  }

  /**
   * Parses the cell coordinates from the cell reference.
   * @param cell - The cell reference in the format 'A1', 'B2', etc.
   * @returns An object with the row and column indices.
   */
  getCellCoordinates(cell: string): { row: number; column: number } {
    // Extracts the column and row from the cell reference using regex
    const [column, row] = cell.match(/([A-Za-z]+)(\d+)/)?.slice(1) || [];

    // Converts the row to a number and the column to its index (0 for 'A', 1 for 'B', etc.)
    return {
      row: parseInt(row, 10), // Converts the row string to a number
      column: column.charCodeAt(0) - 'A'.charCodeAt(0), // Converts the column letter to its index
    };
  }

  /**
   * Distributes an assigned value across cells based on a formula.
   * @param formula - String formula specifying cell references.
   * @param assignedValue - The value to distribute among cells.
   */
  distribute(formula: string, assignedValue: number): any {
    // Extract cell references from the formula
    const cellRefs = formula.split(',').map((ref) => ref.trim());
    let values = []; // Store values and positions
    let p: any; // Store column information

    // Iterate through each cell reference
    for (const cellRef of cellRefs) {
      const singleCell = cellRef.match(/([A-Za-z]+)(\d+)/); // Extract column and row
      if (singleCell) {
        const [column, row] = singleCell.slice(1);
        if (column && row) {
          const rowIndex = parseInt(row, 10) - 1; // Get row index
          const columnIndex = column.charCodeAt(0) - 'A'.charCodeAt(0); // Get column index
          p = column; // Store column for later use

          // Access the specified cell in the form structure
          const rowFormGroup = this.dynamicForm
            .get('rows')
            ?.get(rowIndex.toString()) as FormGroup;
          if (rowFormGroup) {
            const cellValue = rowFormGroup
              .get('cells')
              ?.get(columnIndex.toString());
            if (cellValue !== null) {
              // Store cell's position and value
              values.push({
                rowIndex,
                columnIndex,
                value: parseInt(cellValue?.value, 10),
              });
            }
          }
        }
      }
    }

    // Calculate total values and ratios
    const totalValue = values.reduce((sum, cell) => sum + cell.value, 0);
    const ratios = values.map((cell) => ({
      rowIndex: cell.rowIndex,
      ratio: cell.value / totalValue,
    }));

    // Distribute assigned value based on ratios in a different column
    const targetColumn = 'B'; // Define the target column for distributed values
    ratios.forEach((cell) => {
      const distributedValue = Math.round(assignedValue * cell.ratio);
      const targetColumnIndex = p.charCodeAt(0) - 'A'.charCodeAt(0) + 1; // Get the target column index
      const distributedFormGroup = this.dynamicForm
        .get('rows')
        ?.get(cell.rowIndex.toString()) as FormGroup;
      if (distributedFormGroup) {
        // Set the distributed value in the specified column
        distributedFormGroup
          .get('cells')
          ?.get(targetColumnIndex.toString())
          ?.setValue(distributedValue);
      }
    });
  }

  /**
   * Handles changes in cell values based on specified patterns.
   * @param i Row index
   * @param j Column index
   * @param e Event object
   */
  cellValueChange(i: any, j: any, e: any) {
    const value = e.target.value;

    // Check if the entered value matches a Sum formula pattern
    const sumMatch = value.match(/^=Sum\(([\w\d:,\s]+)\)$/);

    // Check if the entered value matches a Distribute formula pattern
    const distributeMatch = value.match(/^(\d+)=Distribute\(([\w\d:,\s]+)\)$/);

    // Check if the entered value matches a Copy formula pattern
    const copyMatch = value.match(/^([\w\d]+)=Copy\(([\w\d:\s]+)\)$/);

    if (sumMatch) {
      // If the value matches the Sum formula pattern, evaluate the sum and set the value to the current cell
      const cellRefs = sumMatch[1];
      const sum = this.evaluateFormula(cellRefs);
      const currentRow = this.dynamicForm
        .get('rows')
        ?.get(i.toString()) as FormGroup;
      const currentCell = currentRow?.get('cells')?.get(j.toString());
      if (currentCell) {
        currentCell.setValue(sum);
      }
    } else if (distributeMatch) {
      // If the value matches the Distribute formula pattern, distribute the assigned value among cells and set it to the current cell
      const assignedValue = parseInt(distributeMatch[1], 10);
      const cellRefs = distributeMatch[2];
      this.distribute(cellRefs, assignedValue);
      const currentRow = this.dynamicForm
        .get('rows')
        ?.get(i.toString()) as FormGroup;
      const currentCell = currentRow?.get('cells')?.get(j.toString());
      currentCell?.setValue(assignedValue);
    } else if (copyMatch) {
      // If the value matches the Copy formula pattern, copy the assigned value to cells and set it to the current cell
      const assignedValue = copyMatch[1];
      const cellRefs = copyMatch[2];
      this.copy(cellRefs, assignedValue);
      const currentRow = this.dynamicForm
        .get('rows')
        ?.get(i.toString()) as FormGroup;
      const currentCell = currentRow?.get('cells')?.get(j.toString());
      currentCell?.setValue(assignedValue);
    }
  }

  /**
   * Generates a column name based on the index.
   * For indices up to 26, returns single letters (A, B, ..., Z).
   * For larger indices, returns multiple letters (AA, AB, AC, ...).
   *
   * @param index The index of the column
   * @returns The column name as a string
   */
  getColumnName(index: number): string {
    const charCodeA = 'A'.charCodeAt(0); // ASCII code of 'A'
    const columnIndex = index + 1; // Assuming 1-based indexing for columns
    let columnName = '';

    // For indices that exceed 26 (multiple letters)
    if (columnIndex > 26) {
      const firstLetterIndex = Math.floor(index / 26); // Calculate the first letter index for multiple letters
      const firstLetter = String.fromCharCode(charCodeA + firstLetterIndex - 1);

      const secondLetterIndex = index % 26; // Calculate the second letter index for multiple letters
      const secondLetter = String.fromCharCode(charCodeA + secondLetterIndex);

      columnName = firstLetter + secondLetter; // Combine both letters for the column name
    } else {
      columnName = String.fromCharCode(charCodeA + (index % 26)); // Single letter column name for indices up to 26
    }
    return columnName; // Return single letter column name for indices up to 26
  }

  /**
   * converts the data  in csv format
   * @param data list of rowDef and columnDef
   * @returns a string having header(columns) and rows
   */
  // Function to convert data to CSV format
  convertToCSV(data: string[][]): string {
    const header = this.columnDef.join(','); // Create CSV header
    const rows = data.map((row) => row.join(',')); // Convert rows to CSV format
    return `${header}\n${rows.join('\n')}`; // Combine header and rows
  }

  /**
   * it will converts the original data into csv format as download it in local machine
   */
  // Function to download CSV file
  downloadCSV(): void {
    const csvData = this.convertToCSV(this.rowData);

    // Create anchor element and trigger download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'prototype.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
