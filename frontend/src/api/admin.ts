import { api } from './cliente';
import { mensajeError } from './errores';

export interface UsuarioAdminSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'cliente';
}

/** Comprueba la sesión y el rol antes de mostrar datos de administración. */
export async function comprobarAdmin(): Promise<{ usuario: UsuarioAdminSesion | null; error: string | null }> {
  try {
    const { data } = await api.get<UsuarioAdminSesion>('/auth/me');
    if (data.rol !== 'admin') return { usuario: null, error: 'Esta sección está disponible solo para administradores.' };
    return { usuario: data, error: null };
  } catch (e) {
    return { usuario: null, error: mensajeError(e, 'No se pudo verificar el acceso de administrador.') };
  }
}
