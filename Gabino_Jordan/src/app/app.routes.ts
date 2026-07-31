// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'tareas', pathMatch: 'full' },

  {
    path: 'tareas',
    loadComponent: () =>
      import('./features/tareas/tareas.component')
        .then(m => m.TareasComponent)
  },
  {
    path: 'tareas/nueva',
    loadComponent: () =>
      import('./features/tarea-form/tarea-form.component')
        .then(m => m.TareaFormComponent)
  },
  {
    path: 'tareas/editar/:id',
    loadComponent: () =>
      import('./features/tarea-form/tarea-form.component')
        .then(m => m.TareaFormComponent)
  },

  {
    path: 'usuarios',
    loadComponent: () =>
      import('./features/tareas/tareas.component')
        .then(m => m.TareasComponent)
  },
  {
    path: 'usuarios/nuevo',
    loadComponent: () =>
      import('./features/usuario-form/usuario-form.component')
        .then(m => m.UsuarioFormComponent)
  },
  {
    path: 'usuarios/editar/:id',
    loadComponent: () =>
      import('./features/usuario-form/usuario-form.component')
        .then(m => m.UsuarioFormComponent)
  },

  { path: '**', redirectTo: 'tareas' } // ruta comodín (404 → home)
];
