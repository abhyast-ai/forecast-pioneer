import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DataformService } from 'src/app/shared/services/dataform.service';
import { DataforumlaService } from 'src/app/shared/services/dataforumla.service';
import { DatastorageService } from 'src/app/shared/services/datastorage.service';

@Component({
  selector: 'app-datasheet',
  templateUrl: './datasheet.component.html',
  styleUrls: ['./datasheet.component.css'],
})
export class DatasheetComponent implements OnInit {
  dynamicForm: any;
  columnDef: any[] = [];
  rowData: any[] = [];
  targetColumnIndex: any;
  file: any;
  isDropdownOpen = false;
  autosaveTimeout: any;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dataStorageService: DatastorageService,
    private dataFormService: DataformService,
    private dataFormulaService: DataforumlaService
  ) {}

  /**
   * it will create a blank cell
   */
  ngOnInit() {
    this.dynamicForm = this.fb.group({
      rows: this.fb.array([this.createRow()]),
    });

    // Start autosave on form initialization
    this.startAutosave();
  }

  //Detect File Change
  onFileChange(event: any) {
    this.file = event.target.files[0];
    if (this.file) {
      this.readExcelFile(this.file);
    }
  }

  //Read the File and Parse for manipulation
  readExcelFile(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = e.target.result;
      const parsedData = this.dataStorageService.parseExcelData(data);
      this.dataFormService.populateForm(
        this.dynamicForm,
        parsedData,
        this.columnDef
      );
    };

    reader.readAsBinaryString(file);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Creates a row with cells
   * @returns create a row having 'n' cells where n -> no. of columns
   */
  createRow(): FormGroup {
    const firstRow = this.fb.array([
      this.dataFormService.createBlankCell(null),
    ]);
    return this.fb.group({
      cells: firstRow,
    });
  }

  /**
   * Add a new cell to a row
   * @param row returns a form Array representing a row
   */
  addCell(row: FormGroup) {
    // Use the form service to add a new cell
    this.dataFormService.addCell(row);
  }

  /**
   * Adds a new row with the cells
   */
  addRow() {
    // Use the form service to add a new row
    this.dataFormService.addRow(this.dynamicForm);
  }
  // Add autosave logic
  startAutosave() {
    this.dynamicForm.valueChanges.subscribe(() => {
      // Clear existing timeout to avoid unnecessary submissions
      clearTimeout(this.autosaveTimeout);

      // Set a new timeout for autosave after 3 seconds
      this.autosaveTimeout = setTimeout(() => {
        this.onSubmit();
      }, 3000);
    });
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
    const distributeMatch = value.match(
      /^(\d+)=(Distribute|Forecast)\(([\w\d:,\s]+)\)$/
    );

    // Check if the entered value matches a Copy formula pattern
    const copyMatch = value.match(/^([\w\d]+)=Copy\(([\w\d:\s]+)\)$/);

    if (sumMatch) {
      // If the value matches the Sum formula pattern, evaluate the sum and set the value to the current cell
      const cellRefs = sumMatch[1];
      const sum = this.dataFormulaService.evaluateFormula(
        this.dynamicForm,
        cellRefs
      );
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
      const formulaType = distributeMatch[2];
      const cellRefs = distributeMatch[3];
      this.dataFormulaService.distribute(
        this.dynamicForm,
        formulaType,
        cellRefs,
        assignedValue,
        this.targetColumnIndex
      );
      const currentRow = this.dynamicForm
        .get('rows')
        ?.get(i.toString()) as FormGroup;
      const currentCell = currentRow?.get('cells')?.get(j.toString());
      currentCell?.setValue(assignedValue);
    } else if (copyMatch) {
      // If the value matches the Copy formula pattern, copy the assigned value to cells and set it to the current cell
      const assignedValue = copyMatch[1];
      const cellRefs = copyMatch[2];
      this.dataFormulaService.copy(this.dynamicForm, cellRefs, assignedValue);
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
   * it will converts the original data into csv format as download it in local machine
   */
  // Function to download CSV file
  downloadCSV(): void {
    this.isDropdownOpen = true; // Close dropdown after selection
    this.dataStorageService.convertToCSV(this.rowData, this.columnDef);
  }

  /**
   * it will converts the original data into excel format as download it in local machine
   */
  // Function to download Excel file
  downloadExcel(): void {
    this.isDropdownOpen = true; // Close dropdown after selection
    if (this.file == null) {
      //toastr message to show empty file
      this.toastr.error('Empty File!', 'Error');
    }
    this.dataStorageService.updateAndDownloadExcelFile(
      this.file,
      this.columnDef,
      this.rowData
    );
  }
}
