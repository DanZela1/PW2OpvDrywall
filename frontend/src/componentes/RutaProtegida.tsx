
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { api } from '../api/cliente';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'cliente';
}

interface Props {
  rol?: 'admin' | 'cliente';
}

export default function RutaProtegida({ rol }: Props) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let activo = true;

    const verificarSesion = async () => {
      try {
        const respuesta = await api.get<Usuario>('/auth/me');

        if (activo) {
          setUsuario(respuesta.data);
        }
      } catch {
        if (activo) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('usuario');
          setUsuario(null);
        }
      } finally {
        if (activo) {
          setVerificando(false);
        }
      }
    };

    verificarSesion();

    return () => {
      activo = false;
    };
  }, []);

  if (verificando) {
    return <p>Verificando sesión...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rol && usuario.rol !== rol) {
    return <Navigate to={usuario.rol === 'admin' ? '/admin' : '/cuenta'} replace />;
  }

  return <Outlet />;
}
