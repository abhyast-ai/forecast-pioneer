import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ColDef } from 'ag-grid-community';


@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})


export class GridComponent {
//   themeClass =
//   "ag-theme-quartz-dark";

// // Row Data: The data to be displayed.
// rowData: any[] = [
//   {
//     mission: 'Voyager',
//     company: 'NASA',
//     location: 'Cape Canaveral',
//     date: '1977-09-05',
//     rocket: 'Titan-Centaur ',
//     price: 86580000,
//     successful: true,
//   },
//   {
//     mission: 'Apollo 13',
//     company: 'NASA',
//     location: 'Kennedy Space Center',
//     date: '1970-04-11',
//     rocket: 'Saturn V',
//     price: 3750000,
//     successful: false,
//   },
//   {
//     mission: 'Falcon 9',
//     company: 'SpaceX',
//     location: 'Cape Canaveral',
//     date: '2015-12-22',
//     rocket: 'Falcon 9',
//     price: 9750000,
//     successful: true,
//   },
// ];

// // Column Definitions: Defines & controls grid columns.
// colDefs: ColDef<any>[] = [
//   { field: 'mission' },
//   { field: 'company' },
//   { field: 'location' },
//   { field: 'date' },
//   { field: 'price' },
//   { field: 'successful' },
//   { field: 'rocket' },
// ];
dynamicForm: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.dynamicForm = this.fb.group({
      rows: this.fb.array([this.createRow()]),
    });
  }

  createRow(): FormGroup {
    return this.fb.group({
      cells: this.fb.array([this.createCell()]),
    });
  }

  createCell(): FormControl {
    return this.fb.control('');
  }

  addCell(row: FormGroup) {
    const cells = row.get('cells') as FormArray;
    cells.push(this.createCell());
  }

  addRow() {
    const rows = this.dynamicForm.get('rows') as FormArray;
    rows.push(this.createRow());
  }

  onSubmit() {
    console.log(this.dynamicForm.get('rows')?.value);
  }

  evaluateFormula(formula: string): number {
    const match = formula.match(/(\w)(\d+):(\w)(\d+)/);
    if (match) {
      const startColumn = match[1].charCodeAt(0) - 'A'.charCodeAt(0);
      const startRow = parseInt(match[2], 10);
      const endColumn = match[3].charCodeAt(0) - 'A'.charCodeAt(0);
      const endRow = parseInt(match[4], 10);

      let sum = 0;
      for (let i = startRow; i <= endRow; i++) {
        const row = this.dynamicForm
          .get('rows')
          ?.get(i.toString()) as FormGroup;
        if (row) {
          const cellValue = row
            .get('cells')
            ?.get(startColumn.toString())?.value;
          if (cellValue !== undefined && !isNaN(cellValue)) {
            sum += +cellValue;
          }
        }
      }
      return sum;
    }

    return 0; // Invalid formula or range
  }

  cellValueChange(i: any, j: any, e: any) {
    const value = e.target.value;
    const formulaMatch = value.match(/^=Sum\((\w\d+:\w\d+)\)$/);
    if (formulaMatch) {
      const range = formulaMatch[1];
      const sum = this.evaluateFormula(range);
      const currentRow = this.dynamicForm
        .get('rows')
        ?.get(i.toString()) as FormGroup;
      const currentCell = currentRow?.get('cells')?.get(j.toString());
      if (currentCell) {
        currentCell.setValue(sum);
      }
    }
  }
}