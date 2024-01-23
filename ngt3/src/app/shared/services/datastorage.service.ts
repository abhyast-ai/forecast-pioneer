import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class DatastorageService {
  constructor() {}
  parseExcelData(data: any): any[] {
    // You may need to use a library like xlsx for more complex scenarios.
    // For simplicity, let's assume the data is an array of objects.
    // You may need to adjust this logic based on the actual structure of your Excel data.
    // Example assumes the first row is the header.
    const workbook = XLSX.read(data, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const excelData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false, // Keep raw values, don't convert them
      dateNF: 'mm-dd-yyyy', // Specify the date format if needed
    });
    const header: any = excelData[0];
    const rowData = excelData.slice(1);

    rowData.unshift(header);
    console.log(rowData);
    return rowData.map((row: any) => {
      const rowArr: any = [];

      // header.forEach((key: any, index: number) => {

      //   rowArr.push(row[index]);
      // });
      return { cells: row };
    });
  }

   /**
   * converts the data  in csv format
   * @param data list of rowDef and columnDef
   * @returns a string having header(columns) and rows
   */
  // Function to convert data to CSV format
  convertToCSV(data: string[][],columnDef: any[]): void {
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

}
