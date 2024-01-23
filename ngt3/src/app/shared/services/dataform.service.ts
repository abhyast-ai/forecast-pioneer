import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class DataformService {
  constructor(private fb: FormBuilder) {}

  createBlankCell(value: any): FormControl {
    if (value) {
      return this.fb.control(value);
    } else {
      return this.fb.control(''); // Create an empty cell
    }
  }

  createRow(numOfColumns: number): FormGroup {
    const cells = Array.from({ length: numOfColumns }, () => this.createBlankCell(null));
    return this.fb.group({
      cells: this.fb.array(cells),
    });
  }

  populateForm(dynamicForm: FormGroup, data: any[],columnDef: any): void {
    const rows = dynamicForm.get('rows') as FormArray;

    // Clear existing rows
    while (rows.length > 0) {
      rows.removeAt(0);
    }

    if (data.length === 0) {
      return; // No data to populate
    }

    const firstRowObject = data[0];
    const columnOrder = Object.keys(firstRowObject.cells);

    // Create a new row for each object in the data array
    data.forEach((rowObject) => {
      const newRow = this.fb.group({
        cells: this.fb.array([]),
      });

      const cells = newRow.get('cells') as FormArray;

      // Iterate over columns in the order they appear in the Excel data
      columnOrder.forEach((columnName) => {
        cells.push(this.createBlankCell(rowObject.cells[columnName]));
      });

      // Add the new row to the form
      rows.push(newRow);
    });

    // Set column definitions based on the specified column order
    columnDef = columnOrder;
  }
  


  addRow(dynamicForm: FormGroup): void {
    const rows = dynamicForm.get('rows') as FormArray;
    const firstRowCells = (rows.at(0) as FormGroup).get('cells') as FormArray;
    const numOfColumns = firstRowCells.length;

    const newRow = this.createRow(numOfColumns);
    rows.push(newRow);
  }

  addCell(row: FormGroup): void {
    const cells = row.get('cells') as FormArray;
    cells.push(this.createBlankCell(null));
  }
}
