
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../api/cliente';

export default function RestablecerPassword() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const restablecerPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!token) {
      setError('El enlace de recuperación no contiene un token válido.');
      return;
    }

    if (token.length < 20 || token.length > 1000) {
      setError('El token de recuperación es inválido.');
      return;
    }

    if (password.length < 6 || password.length > 72) {
      setError('La contraseña debe tener entre 6 y 72 caracteres.');
      return;
    }

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await api.post<{ mensaje: string }>(
        '/auth/restablecer-password',
        { token, password }
      );

      setMensaje(respuesta.data.mensaje);
      setCompletado(true);
      setPassword('');
      setConfirmarPassword('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.mensaje ||
          err.response?.data?.error ||
          'No se pudo restablecer la contraseña.'
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
      <h1>Nueva contraseña</h1>

      {!token ? (
        <div>
          <p>
            El enlace de recuperación es inválido o no contiene un token.
          </p>
          <Link to="/olvide-password">
            Solicitar otro enlace
          </Link>
        </div>
      ) : completado ? (
        <div>
          <p role="status">{mensaje}</p>
          <Link to="/login">Iniciar sesión</Link>
        </div>
      ) : (
        <>
          <p>
            Ingresa tu nueva contraseña para recuperar el acceso
            a tu cuenta.
          </p>

          <form onSubmit={restablecerPassword}>
            <div>
              <label htmlFor="password">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmarPassword">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmarPassword"
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={cargando}>
              {cargando ? 'Restableciendo...' : 'Guardar contraseña'}
            </button>
          </form>

          {error && <p role="alert">{error}</p>}

          <p>
            <Link to="/olvide-password">
              Solicitar otro enlace
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
