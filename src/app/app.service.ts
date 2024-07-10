import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeatmapService {
  private apiUrl = './assets/heatmap-data.json';

  constructor(private http: HttpClient) {}

  getStaticData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
