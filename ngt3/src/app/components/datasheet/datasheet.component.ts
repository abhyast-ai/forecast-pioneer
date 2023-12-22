import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
@Component({
  selector: 'app-datasheet',
  templateUrl: './datasheet.component.html',
  styleUrls: ['./datasheet.component.css']
})

export class DatasheetComponent implements OnInit {
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
    const cellRefs = formula.split(',').map((ref) => ref.trim());

    let sum = 0;
    for (const cellRef of cellRefs) {
      const rangeMatch = cellRef.match(/(\w\d+:\w\d+)/);
      if (rangeMatch) {
        const [startCell, endCell] = rangeMatch[0].split(':');
        const start = this.getCellCoordinates(startCell);
        const end = this.getCellCoordinates(endCell);

        for (let i = start.row-1; i <= end.row-1; i++) {
          for (let j = start.column; j <= end.column; j++) {
            const rowFormGroup = this.dynamicForm
              .get('rows')
              ?.get(i.toString()) as FormGroup;
            if (rowFormGroup) {
              const cellValue = rowFormGroup
                .get('cells')
                ?.get(j.toString())?.value;
              if (cellValue !== undefined && !isNaN(cellValue)) {
                sum += +cellValue;
              }
            }
          }
        }
      } else {
        const singleCell = cellRef.match(/(\w\d+)/);
        if (singleCell) {
          const [column, row] =
            singleCell[0].match(/([A-Za-z]+)(\d+)/)?.slice(1) || [];
          if (column && row) {
            const rowIndex = parseInt(row, 10)-1;
            const columnIndex = column.charCodeAt(0) - 'A'.charCodeAt(0);

            const rowFormGroup = this.dynamicForm
              .get('rows')
              ?.get(rowIndex.toString()) as FormGroup;
            if (rowFormGroup) {
              const cellValue = rowFormGroup
                .get('cells')
                ?.get(columnIndex.toString())?.value;
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
  copy(formula: string, assignedValue: number) {
    const cellRefs = formula.split(',').map((ref) => ref.trim());
    for (const cellRef of cellRefs) {
      // const rangeMatch = cellRef.match(/(\w\d+:\w\d+)/);
      const rangeMatch = cellRef.match(/(\w\d+:\w\d+)/);
      if (rangeMatch) {
        const [startCell, endCell] = rangeMatch[0].split(':');
        const start = this.getCellCoordinates(startCell);
        const end = this.getCellCoordinates(endCell);

        for (let i = start.row; i <= end.row; i++) {
          for (let j = start.column; j <= end.column; j++) {
            const rowFormGroup = this.dynamicForm
              .get('rows')
              ?.get(i.toString()) as FormGroup;
            if (rowFormGroup) {
              const cell = rowFormGroup.get('cells')?.get(j.toString());
              cell?.setValue(assignedValue);
            }
          }
        }
      }
    }
  }
  getCellCoordinates(cell: string): { row: number; column: number } {
    const [column, row] = cell.match(/([A-Za-z]+)(\d+)/)?.slice(1) || [];
    return {
      row: parseInt(row, 10),
      column: column.charCodeAt(0) - 'A'.charCodeAt(0),
    };
  }

  distribute(formula: string, assignedValue: number): any {
    const cellRefs = formula.split(',').map((ref) => ref.trim());
    let values = [];
    let p: any;
    for (const cellRef of cellRefs) {
      const singleCell = cellRef.match(/([A-Za-z]+)(\d+)/);
      if (singleCell) {
        const [column, row] = singleCell.slice(1);
        if (column && row) {
          const rowIndex = parseInt(row, 10)-1;
          const columnIndex = column.charCodeAt(0) - 'A'.charCodeAt(0);
          p = column;
          const rowFormGroup = this.dynamicForm
            .get('rows')
            ?.get(rowIndex.toString()) as FormGroup;
          if (rowFormGroup) {
            const cellValue = rowFormGroup
              .get('cells')
              ?.get(columnIndex.toString());
            if (cellValue !== null) {
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
    const targetColumn = 'B'; // You can adjust this to the desired target column
    ratios.forEach((cell) => {
      const distributedValue = Math.round(assignedValue * cell.ratio);
      const targetColumnIndex = p.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
      const distributedFormGroup = this.dynamicForm
        .get('rows')
        ?.get(cell.rowIndex.toString()) as FormGroup;
      if (distributedFormGroup) {
        distributedFormGroup
          .get('cells')
          ?.get(targetColumnIndex.toString())
          ?.setValue(distributedValue);
      }
    });
  }

  cellValueChange(i: any, j: any, e: any) {
    const value = e.target.value;
    const formulaMatch = value.match(/^=Sum\(([\w\d:,\s]+)\)$/);
    const distributeMatch = value.match(/^(\d+)=Distribute\(([\w\d:,\s]+)\)$/);
    // const copyMatch = value.match(/^(\d+)=Copy\(([\w\d:\s]+)\)$/);
    const copyMatch = value.match(/^([\w\d]+)=Copy\(([\w\d:\s]+)\)$/);
    //const copyMatch = value.match(/^([\w\d]+)=Copy\(([\w\d:\s]+)\)$/);
    if (formulaMatch) {
      const cellRefs = formulaMatch[1];
      const sum = this.evaluateFormula(cellRefs);
      const currentRow = this.dynamicForm
        .get('rows')
        ?.get(i.toString()) as FormGroup;
      const currentCell = currentRow?.get('cells')?.get(j.toString());
      if (currentCell) {
        currentCell.setValue(sum);
      }
    } else if (distributeMatch) {
      const assignedValue = parseInt(distributeMatch[1], 10);
      const cellRefs = distributeMatch[2];
      this.distribute(cellRefs, assignedValue);
      const currentRow = this.dynamicForm
        .get('rows')
        ?.get(i.toString()) as FormGroup;
      const currentCell = currentRow?.get('cells')?.get(j.toString());
      currentCell?.setValue(assignedValue);
    } else if (copyMatch) {
      //const assignedValue = parseInt(copyMatch[1], 10);
      const assignedValue =copyMatch[1]
      const cellRefs = copyMatch[2];
      this.copy(cellRefs, assignedValue);
      const currentRow = this.dynamicForm
        .get('rows')
        ?.get(i.toString()) as FormGroup;
      const currentCell = currentRow?.get('cells')?.get(j.toString());
      currentCell?.setValue(assignedValue);
    }
  }

  getColumnName(index: number): string {
    const charCodeA = 'A'.charCodeAt(0);
    const columnIndex = index + 1; // Assuming 1-based indexing
    const columnName = String.fromCharCode(charCodeA + index % 26);
   
    // If you want to handle multiple letters for larger indices (e.g., AA, AB, AC, ...)
    
    if (columnIndex > 26) {
      const firstLetter = String.fromCharCode(charCodeA + Math.floor((index - 1) / 26) - 1);
      const secondLetter = columnName;
      return firstLetter + secondLetter;
    }
   
    return columnName;
  }
}

