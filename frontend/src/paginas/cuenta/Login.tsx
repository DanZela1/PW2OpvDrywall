
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../../api/cliente';

interface RespuestaLogin {
  token: string;
  tipo: string;
  expiraEn: string;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    rol: 'admin' | 'cliente';
  };
}

export default function Login() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const respuesta = await api.post<RespuestaLogin>('/auth/login', {
        correo,
        password,
      });

      // Almacenamiento provisional para probar el login.
      // Después implementaremos la sesión centralizada.
      sessionStorage.setItem('token', respuesta.data.token);
      sessionStorage.setItem(
        'usuario',
        JSON.stringify(respuesta.data.usuario)
      );

      if (respuesta.data.usuario.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/cuenta');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
          'No se pudo iniciar sesión. Verifica tus datos.'
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
      <h1>Iniciar sesión</h1>

      <form onSubmit={iniciarSesion}>
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
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Iniciando sesión...' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
