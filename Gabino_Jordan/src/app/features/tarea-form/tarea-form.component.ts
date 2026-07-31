// src/app/components/tarea-form/tarea-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TareaService } from '../../Services/tarea.service';
import { Observable } from 'rxjs';
import { Tarea } from '../../models/tarea';

@Component({
  selector: 'app-tarea-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tarea-form.component.html',
  styleUrl: './tarea-form.component.css'
})
export class TareaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tareaService = inject(TareaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  idTarea: number | null = null;
  guardando = false;
  error = '';

  form = this.fb.group({
    idUsuario: [null as number | null, [Validators.required]],
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    fechaVencimiento: [null as string | null],
    estado: ['Pendiente', [Validators.required]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idTarea = +id;
      this.tareaService.getTarea(this.idTarea).subscribe({
        next: (tarea) => this.form.patchValue(tarea),
        error: () => this.error = 'No se pudo cargar la tarea'
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const datos = this.form.getRawValue() as Tarea;

    const peticion: Observable<unknown> = this.idTarea
      ? this.tareaService.actualizarTarea(this.idTarea, datos)
      : this.tareaService.crearTarea(datos);

    peticion.subscribe({
      next: () => this.router.navigate(['/tareas']),
      error: () => {
        this.error = 'Ocurrió un error al guardar la tarea';
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/tareas']);
  }
}
