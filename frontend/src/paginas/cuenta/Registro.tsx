
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../api/cliente';

export default function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const registrarUsuario = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6 || password.length > 72) {
      setError('La contraseña debe tener entre 6 y 72 caracteres');
      return;
    }

    setCargando(true);

    try {
      await api.post('/auth/registro', {
        nombre,
        correo,
        password,
      });

      navigate('/login', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.mensaje ||
          err.response?.data?.error ||
          'No se pudo completar el registro.'
        );
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main>
      <h1>Crear cuenta</h1>

      <form onSubmit={registrarUsuario}>
        <div>
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

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

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            maxLength={72}
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmarPassword">Confirmar contraseña</label>
          <input
            id="confirmarPassword"
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      <p>
        ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </main>
  );
}
