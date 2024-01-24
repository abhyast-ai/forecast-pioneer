import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class DataforumlaService {

  constructor(private fb: FormBuilder) {}
 
  /**
   * Evaluates a formula string to calculate a numerical result.
   * @param formula - The formula string to evaluate.
   * @returns The result of the formula as a number.
   */
  evaluateFormula(dynamicForm:any,formula: string): number {
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
            const rowFormGroup = dynamicForm
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
            const rowFormGroup = dynamicForm
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
   * Copies the assigned value to cells based on a given formula.
   * @param formula The formula containing cell references.
   * @param assignedValue The value to be assigned to cells.
   */
  copy(dynamicForm:any,formula: string, assignedValue: number) {
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
            const rowFormGroup = dynamicForm
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
   * Distributes an assigned value across cells based on a formula.
   * @param formula - String formula specifying cell references.
   * @param assignedValue - The value to distribute among cells.
   */
  distribute(dynamicForm:any,formulaType: string, formula: string, assignedValue: number,targetColumnIndex:any): any {
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
          const rowFormGroup = dynamicForm
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

    ratios.forEach((cell) => {
      const distributedValue = Math.round(assignedValue * cell.ratio);
      if (formulaType === 'Forecast') {
        targetColumnIndex = p.charCodeAt(0) - 'A'.charCodeAt(0) + 1; // Get the target column index
      } else if (formulaType === 'Distribute') {
        targetColumnIndex = p.charCodeAt(0) - 'A'.charCodeAt(0);
      }
      const distributedFormGroup = dynamicForm
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
}
