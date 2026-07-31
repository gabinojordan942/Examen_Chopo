// tarea.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tarea } from '../models/tarea';

@Injectable({ providedIn: 'root' })
export class TareaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/tareas`;

  getTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(this.baseUrl);
  }

  getTarea(id: number): Observable<Tarea> {
    return this.http.get<Tarea>(`${this.baseUrl}/${id}`);
  }

  crearTarea(tarea: Partial<Tarea>): Observable<Tarea> {
    return this.http.post<Tarea>(this.baseUrl, tarea);
  }

  actualizarTarea(id: number, tarea: Partial<Tarea>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, tarea);
  }

  eliminarTarea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
