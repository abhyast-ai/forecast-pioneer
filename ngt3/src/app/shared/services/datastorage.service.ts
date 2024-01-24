import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class DatastorageService {
  constructor() {}
  parseExcelData(data: any): any[] {    
    const workbook = XLSX.read(data, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false, // Keep raw values, don't convert them
      dateNF: 'mm-dd-yyyy', // Specify the date format if needed
    });
    const header: any = excelData[0];
    const rowData = excelData.slice(1);

    rowData.unshift(header);
    return rowData.map((row: any) => {
      const rowArr: any = [];

      return { cells: row };
    });
  }

  /**
   * converts the data  in csv format
   * @param data list of rowDef and columnDef
   * @returns a string having header(columns) and rows
   */
  // Function to convert data to CSV format
  convertToCSV(data: string[][], columnDef: any[]): void {
    const header = columnDef.join(','); // Create CSV header
    const rows = data.map((row) => row.join(',')); // Convert rows to CSV format
    const csvData = `${header}\n${rows.join('\n')}`; // Combine header and rows
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

  updateAndDownloadExcelFile(
    file: File,
    columnDef: string[],
    rowData: any[]
  ): void {
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const data = e.target.result;
      const parsedData = this.parseExcelData(data);

      this.updateExcelData(parsedData, columnDef, rowData);

      //Trigger download
      this.downloadExcelFile(parsedData);
    };

    reader.readAsBinaryString(file);
  }
  private updateExcelData(data: any, columnDef: any[], rowData: any[]): any {
    // Extract header and rows from data
    const header = data[0].cells;
    const rows = data.slice(1);

    // Update header based on columnDef
    header.forEach((col: any, index: any) => {
      if (columnDef[index]) {
        header[index] = columnDef[index];
      }
    });

    // Update rowData
    rows.forEach((row: any, rowIndex: any) => {
      row.cells.forEach((cell: any, colIndex: any) => {
        if (rowData[rowIndex] && rowData[rowIndex][colIndex]) {
          row.cells[colIndex] = rowData[rowIndex][colIndex];
        }
      });
    });

    // Convert the updated data back to the Excel format
    return [header, ...rows];
  }

  private downloadExcelFile(data: any): void {
    const updatedData = this.convertToExcelFormat(data);
    const blob = new Blob([this.s2ab(updatedData)], {
      type: 'application/octet-stream',
    });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'updated_excel_file.xlsx';
    link.click();
  }
  private convertToExcelFormat(data: any): any {
    const header = data[0]?.cells ?? [];
    const rows = data.slice(1) || [];

    const sheetData = rows.map((row: any) => {
      return header.map((col: any, index: number) => row?.cells[index]);
    });

    const sheet = XLSX.utils.aoa_to_sheet([header, ...sheetData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

    return workbook;
  }

  private s2ab(workbook: any): ArrayBuffer {
    const s = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);

    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;

    return buf;
  }
}
