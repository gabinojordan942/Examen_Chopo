/*import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'tareas/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'usuarios/editar/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];*/
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'tareas', renderMode: RenderMode.Client },
  { path: 'tareas/nueva', renderMode: RenderMode.Client },
  { path: 'tareas/editar/:id', renderMode: RenderMode.Client },
  { path: 'usuarios', renderMode: RenderMode.Client },
  { path: 'usuarios/nuevo', renderMode: RenderMode.Client },
  { path: 'usuarios/editar/:id', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender }
];
