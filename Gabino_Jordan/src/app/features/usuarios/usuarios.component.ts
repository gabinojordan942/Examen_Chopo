// src/app/features/usuarios/usuarios.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../Services/usuario.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-usuarios',
  imports: [RouterLink],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  usuarios = signal<Usuario[]>([]);

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  eliminarUsuario(id: number, nombre: string): void {
    const confirmado = confirm(`¿Eliminar a "${nombre}"? Esto también eliminará sus tareas.`);
    if (!confirmado) return;

    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () => this.usuarios.update(lista => lista.filter(u => u.idUsuario !== id)),
      error: () => alert('No se pudo eliminar el usuario')
    });
  }
}
