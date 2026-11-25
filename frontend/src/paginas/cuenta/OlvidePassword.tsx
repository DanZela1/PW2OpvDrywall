
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../api/cliente';

export default function OlvidePassword() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const recuperarPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setCargando(true);

    try {
      const respuesta = await api.post<{ mensaje: string }>(
        '/auth/olvide-password',
        { correo }
      );

      setMensaje(respuesta.data.mensaje);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.mensaje ||
          err.response?.data?.error ||
          'No se pudo procesar la solicitud.'
        );
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <section>
      <h1>Recuperar contraseña</h1>

      <p>
        Ingresa tu correo electrónico para recibir
        un enlace de recuperación de contraseña.
      </p>

      <form onSubmit={recuperarPassword}>
        <div>
          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>

      {mensaje && <p role="status">{mensaje}</p>}
      {error && <p role="alert">{error}</p>}

      <p>
        <Link to="/login">Volver a iniciar sesión</Link>
      </p>
    </section>
  );
}
