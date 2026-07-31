export type EstadoTarea = 'Pendiente' | 'En Progreso' | 'Completada' | string;

export interface Tarea {
  idTarea?: number;       // Se genera en el backend (Key), opcional al crear
  idUsuario: number;
  titulo: string;
  fechaVencimiento?: string | null; // ISO string (DateTime? en C#)
  estado: EstadoTarea;
}
