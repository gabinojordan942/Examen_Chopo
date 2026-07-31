import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Tarea } from '../models/tarea.model';
import { UsuarioPendiente } from '../models/usuario-pendiente.model';
import { TareaCreadaResult } from '../models/tarea-creada-result.model';

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private http = inject(HttpClient);

  // environment.apiUrl ya incluye '/api' -> https://localhost:7019/api
  private baseUrl = `${environment.apiUrl}/tareas`;

  /**
   * GET /api/tareas/pendientes
   * Reporte de pendientes/vencidas agrupado por usuario (SELECT via SP)
   */
  getPendientesPorUsuario(): Observable<UsuarioPendiente[]> {
    return this.http.get<UsuarioPendiente[]>(`${this.baseUrl}/pendientes`);
  }

  /**
   * POST /api/tareas
   * Crea una tarea nueva (INSERT via SP). Devuelve el id de la tarea creada.
   */
  create(tarea: Omit<Tarea, 'idTarea'>): Observable<TareaCreadaResult> {
    return this.http.post<TareaCreadaResult>(this.baseUrl, tarea);
  }

  /**
   * PUT /api/tareas/{id}
   * Actualiza campos de una tarea (UPDATE via SP). Los campos omitidos no cambian,
   * por eso se acepta un objeto parcial.
   */
  update(id: number, cambios: Partial<Tarea>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, cambios);
  }

  /**
   * DELETE /api/tareas/{id}
   * Elimina una tarea (DELETE via SP)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
