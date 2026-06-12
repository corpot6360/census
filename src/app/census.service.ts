import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CensusRecord } from './census.model';

@Injectable({ providedIn: 'root' })
export class CensusService {
  private readonly apiUrl = '/api/census';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<CensusRecord[]> {
    return this.http.get<CensusRecord[]>(this.apiUrl);
  }

  create(record: CensusRecord): Observable<CensusRecord> {
    return this.http.post<CensusRecord>(this.apiUrl, record);
  }

  update(id: string, record: CensusRecord): Observable<CensusRecord> {
    return this.http.put<CensusRecord>(`${this.apiUrl}/${id}`, record);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}