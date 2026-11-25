
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../api/cliente';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'cliente';
}

export default function MiCuenta() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const obtenerUsuario = async () => {
      try {
        const respuesta = await api.get<Usuario>('/auth/me');

        if (activo) {
          setUsuario(respuesta.data);
        }
      } catch (err) {
        if (activo) {
          if (axios.isAxiosError(err)) {
            setError(
              err.response?.data?.mensaje ||
              err.response?.data?.error ||
              'No se pudieron obtener los datos del usuario.'
            );
          } else {
            setError('Ocurrió un error inesperado.');
          }
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    obtenerUsuario();

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) {
    return <p>Cargando información de la cuenta...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!usuario) {
    return <p>No se encontró información del usuario.</p>;
  }

  return (
    <section>
      <h1>Mi cuenta</h1>

      <h2>Información personal</h2>

      <p>
        <strong>Nombre:</strong> {usuario.nombre}
      </p>

      <p>
        <strong>Correo electrónico:</strong> {usuario.correo}
      </p>

      <p>
        <strong>Tipo de cuenta:</strong> {usuario.rol}
      </p>

      <Link to="/cuenta/cotizaciones">
        Ver mis cotizaciones
      </Link>
    </section>
  );
}
