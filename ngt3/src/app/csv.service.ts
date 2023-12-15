import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvService {

  private apiUrl = 'http://localhost:5063/api';

  constructor(private http: HttpClient) { }

  uploadCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any[]>(`${this.apiUrl}/upload-csv`, formData);
  }
}
