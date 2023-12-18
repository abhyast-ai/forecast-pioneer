// import { Component, OnInit } from '@angular/core';
// import { CsvService } from './csv.service';
// import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit {
//   dynamicForm:any;

//   constructor(private fb: FormBuilder) {}

//   ngOnInit() {
//     this.dynamicForm = this.fb.group({
//       rows: this.fb.array([this.createRow()])
//     });
//   }
//   createRow(): FormGroup {
//     return this.fb.group({
//       cells: this.fb.array([this.createCell()])
//     });
//   }
//   createCell(): FormControl {
//     return this.fb.control('');
//   }
//   addCell(row: FormGroup) {
//     const cells = row.get('cells') as FormArray;
//     cells.push(this.createCell());
//   }
//   addRow() {
//     const rows = this.dynamicForm.get('rows') as FormArray;
//     rows.push(this.createRow());
//   }
//   onSubmit(){
//     console.log(this.dynamicForm.get('rows').value);
//   }
//   getAggregate(i:any,j:any){
//     let sum=0;
//    const currentRow = this.dynamicForm.get('rows').get(i.toString()) as FormGroup;
//    const currentCell = currentRow?.get('cells')?.get(j.toString());
//    for(let k=1;k<=i-1;k++){
//     const row = this.dynamicForm.get('rows').get(k.toString()) as FormGroup;
//     const cellValue = row?.get('cells')?.get(j.toString())?.value;

//     if (cellValue !== undefined) {
//       console.log(cellValue);

//       sum+=+cellValue;
//       // Do something with cellValue
//     }
//     if (currentCell) {
//       currentCell.setValue(sum);
//     }
//    }
//   }
//   cellValueChange(i:any,j:any,e:any){
//     const value=e.target.value;
//     if(value.includes("=Sum")){
//       this.getAggregate(i,j);
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
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
