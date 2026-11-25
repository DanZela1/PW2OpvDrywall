
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../api/cliente';

interface Cotizacion {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  tipoServicio: string;
  ubicacion: string;
  descripcion: string;
  estado: 'pendiente' | 'en_revision' | 'enviada' | 'aceptada' | 'rechazada';
  subtotal: number | null;
  impuesto: number | null;
  total: number | null;
  usuarioId?: number | null;
  clienteId?: number | null;
}

const nombresEstados: Record<Cotizacion['estado'], string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  enviada: 'Enviada',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
};

export default function MisCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const obtenerCotizaciones = async () => {
      try {
        const respuesta = await api.get<Cotizacion[]>('/cotizaciones/mias');

        if (activo) {
          setCotizaciones(respuesta.data);
        }
      } catch (err) {
        if (activo) {
          if (axios.isAxiosError(err)) {
            setError(
              err.response?.data?.mensaje ||
              err.response?.data?.error ||
              'No se pudieron cargar las cotizaciones.'
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

    obtenerCotizaciones();

    return () => {
      activo = false;
    };
  }, []);

  const mostrarMonto = (monto: number | null) => {
    if (monto === null) {
      return 'Pendiente de cálculo';
    }

    return `L ${Number(monto).toFixed(2)}`;
  };

  if (cargando) {
    return <p>Cargando mis cotizaciones...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <section>
      <h1>Mis cotizaciones</h1>

      <p>
        Aquí puedes consultar las solicitudes de cotización
        asociadas a tu cuenta.
      </p>

      {cotizaciones.length === 0 ? (
        <div>
          <p>Todavía no tienes cotizaciones registradas.</p>
          <Link to="/cotizar">Solicitar una cotización</Link>
        </div>
      ) : (
        <div>
          {cotizaciones.map((cotizacion) => (
            <article key={cotizacion.id}>
              <h2>Cotización #{cotizacion.id}</h2>

              <p>
                <strong>Servicio:</strong> {cotizacion.tipoServicio}
              </p>

              <p>
                <strong>Ubicación:</strong> {cotizacion.ubicacion}
              </p>

              <p>
                <strong>Descripción:</strong> {cotizacion.descripcion}
              </p>

              <p>
                <strong>Estado:</strong> {nombresEstados[cotizacion.estado]}
              </p>

              <p>
                <strong>Subtotal:</strong> {mostrarMonto(cotizacion.subtotal)}
              </p>

              <p>
                <strong>Impuesto:</strong> {mostrarMonto(cotizacion.impuesto)}
              </p>

              <p>
                <strong>Total:</strong> {mostrarMonto(cotizacion.total)}
              </p>

              <hr />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
