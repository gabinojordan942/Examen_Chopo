// src/app/components/usuario-form/usuario-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../Services/usuario.service';
import { Usuario } from '../../models/usuario';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-usuario-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css'
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  idUsuario: number | null = null;
  guardando = false;
  error = '';

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idUsuario = +id;
      this.usuarioService.getUsuario(this.idUsuario).subscribe({
        next: (usuario) => this.form.patchValue(usuario),
        error: () => this.error = 'No se pudo cargar el usuario'
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const datos = this.form.getRawValue() as Usuario;

    const peticion: Observable<unknown> = this.idUsuario
      ? this.usuarioService.actualizarUsuario(this.idUsuario, datos)
      : this.usuarioService.crearUsuario(datos);

    peticion.subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: () => {
        this.error = 'Ocurrió un error al guardar el usuario';
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }
}
