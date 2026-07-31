import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareaService } from '../../core/services/tarea.service';
import { Tarea } from '../../core/models/tarea.model';
import { UsuarioPendiente } from '../../core/models/usuario-pendiente.model';
import { Router } from '@angular/router';

const TAREA_VACIA: Omit<Tarea, 'idTarea'> = {
  idUsuario: 1,
  titulo: '',
  fechaVencimiento: null,
  estado: 'Pendiente'
};

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tareas.component.html',
  styleUrl: './tareas.component.css'
})
export class TareasComponent implements OnInit {
  private tareaService = inject(TareaService);
  private router = inject(Router);

  // Reporte agregado (única fuente de "listado" que expone la API)
  reporte = signal<UsuarioPendiente[]>([]);
  cargandoReporte = signal(true);

  error = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  // Formulario de creación
  form = signal<Omit<Tarea, 'idTarea'>>({ ...TAREA_VACIA });

  // Edición / eliminación por ID (la API no expone listar tareas individuales)
  idEditar = signal<number | null>(null);
  cambiosEdicion = signal<Partial<Tarea>>({});
  idEliminar = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargandoReporte.set(true);
    this.error.set(null);

    this.tareaService.getPendientesPorUsuario().subscribe({
      next: (data) => {
        this.reporte.set(data);
        this.cargandoReporte.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.cargandoReporte.set(false);
      }
    });
  }

  crearTarea(): void {
    const tarea = this.form();

    if (!tarea.titulo.trim()) {
      this.error.set('El título es obligatorio');
      return;
    }

    this.error.set(null);
    this.mensajeExito.set(null);

    this.tareaService.create(tarea).subscribe({
      next: (res) => {
        this.mensajeExito.set(`Tarea creada con ID ${res.idTareaCreada}`);
        this.form.set({ ...TAREA_VACIA });
        this.cargarReporte(); // refresca el reporte agregado
      },
      error: (err) => this.error.set(err.message)
    });
  }

  actualizarTarea(): void {
    const id = this.idEditar();
    if (id === null) {
      this.error.set('Indica el ID de la tarea a actualizar');
      return;
    }

    this.error.set(null);
    this.mensajeExito.set(null);

    this.tareaService.update(id, this.cambiosEdicion()).subscribe({
      next: () => {
        this.mensajeExito.set(`Tarea ${id} actualizada`);
        this.cambiosEdicion.set({});
        this.idEditar.set(null);
        this.cargarReporte();
      },
      error: (err) => this.error.set(err.message)
    });
  }

  setTituloEdicion(titulo: string): void {
    this.cambiosEdicion.set({ ...this.cambiosEdicion(), titulo });
  }

  setEstadoEdicion(estado: Tarea['estado']): void {
    this.cambiosEdicion.set({ ...this.cambiosEdicion(), estado });
  }

  eliminarTarea(): void {
    const id = this.idEliminar();
    if (id === null) {
      this.error.set('Indica el ID de la tarea a eliminar');
      return;
    }

    if (!confirm(`¿Eliminar la tarea con ID ${id}?`)) return;

    this.tareaService.delete(id).subscribe({
      next: () => {
        this.mensajeExito.set(`Tarea ${id} eliminada`);
        this.idEliminar.set(null);
        this.cargarReporte();
      },
      error: (err) => this.error.set(err.message)
    });
  }

  editarTarea(id: number): void {
    this.router.navigate(['/tareas/editar', id])
  }
}
