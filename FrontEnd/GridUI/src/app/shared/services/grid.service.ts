import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GridService {
  private apiUrl = 'http://localhost:4000';
  constructor(private http: HttpClient) {}

  addColumn(columnData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addColumn`, columnData);
  }

  addRow(rowData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addRow`, rowData);
  }

  editColumn(id: string, columnData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/editColumn/${id}`, columnData);
  }

  deleteColumn(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteColumn/${id}`);
  }

  getColumns(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getColumns`);
  }

  getRows(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getRows`);
  }

  editRow(id: string, rowData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/editRow/${id}`, rowData);
  }

  deleteRow(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteRow/${id}`);
  }
}
