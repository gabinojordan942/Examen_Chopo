import { Usuario } from "./usuario";

export interface Tarea {
  idTarea: number;
  idUsuario: number;
  titulo: string;
  fechaVencimiento: string | null;
  estado: 'Pendiente' | 'En progreso' | 'Completada' | 'Cancelada';
}

// Si el endpoint devuelve el usuario embebido
export interface TareaConUsuario extends Tarea {
  usuario: Usuario;
}
