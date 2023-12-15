import { Component, OnInit } from '@angular/core';
import { CsvService } from './csv.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  dynamicForm:any;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.dynamicForm = this.fb.group({
      rows: this.fb.array([this.createRow()])
    });
  }
  createRow(): FormGroup {
    return this.fb.group({
      cells: this.fb.array([this.createCell()])
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
  onSubmit(){
    console.log(this.dynamicForm.value);
  }
}
