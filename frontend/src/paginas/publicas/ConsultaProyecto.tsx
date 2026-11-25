import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/cliente';
import ErrorCampo from '../../componentes/ErrorCampo';
import { mensajeError, type Proyecto } from '../../tipos';

// Lo que se muestra del proyecto consultado
type ProyectoConsulta = Partial<Pick<Proyecto, 'codigo' | 'estado' | 'notas'>>;

interface Datos {
  correo: string;
  codigo: string;
}
type Campo = keyof Datos;
type Errores = Partial<Record<Campo, string>>;

function validar(d: Datos): Errores {
  const e: Errores = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = 'El email es requerido y debe ser válido.';
  if (!d.codigo.trim()) e.codigo = 'El código del proyecto es requerido.';
  return e;
}

export default function ConsultaProyecto() {
  // Los enlaces de los correos pueden traer los datos:  /#/consulta?correo=...&codigo=...
  const [params] = useSearchParams();
  const [datos, setDatos] = useState<Datos>({
    correo: params.get('correo') ?? '',
    codigo: params.get('codigo') ?? '',
  });
  const [errores, setErrores] = useState<Errores>({});
  const [consultando, setConsultando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ProyectoConsulta | null>(null);

  const cambiar = (campo: Campo) => (ev: ChangeEvent<HTMLInputElement>) => {
    const valor = ev.target.value;
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  async function consultar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const encontrados = validar(datos);
    setErrores(encontrados);
    setResultado(null);
    if (Object.keys(encontrados).length > 0) {
      setError('Revisa los campos marcados.');
      return;
    }

    setConsultando(true);
    setError(null);
    try {
      const { data } = await api.post<ProyectoConsulta>('/proyectos/consulta', {
        correo: datos.correo.trim(),
        codigo: datos.codigo.trim(),
      });
      setResultado(data);
    } catch (e) {
      // Un 404 de la API llega aquí con su mensaje (por ejemplo, que no existe ese proyecto)
      setError(mensajeError(e));
    } finally {
      setConsultando(false);
    }
  }

  return (
    <div className="main-reg">
      <div className="form-container">
        <h2>Consultar mi proyecto</h2>
        <form onSubmit={consultar} noValidate>
          <label htmlFor="consulta-correo">Email:</label>
          <input
            type="email" id="consulta-correo" name="correo" maxLength={120} autoComplete="email"
            value={datos.correo} onChange={cambiar('correo')}
            aria-invalid={!!errores.correo} aria-describedby="consulta-correo-error"
          />
          <ErrorCampo id="consulta-correo-error" texto={errores.correo} />

          <label htmlFor="consulta-codigo">Código del proyecto:</label>
          <input
            type="text" id="consulta-codigo" name="codigo" maxLength={20}
            value={datos.codigo} onChange={cambiar('codigo')}
            aria-invalid={!!errores.codigo} aria-describedby="consulta-codigo-error"
          />
          <ErrorCampo id="consulta-codigo-error" texto={errores.codigo} />

          <button type="submit" disabled={consultando}>{consultando ? 'Consultando...' : 'Consultar'}</button>
          <p className={`form-status ${error ? 'status-error' : ''}`} role="status" aria-live="polite">
            {error}
          </p>
        </form>

        {resultado && (
          <div role="status" style={{ marginTop: 15, textAlign: 'center' }}>
            <p><strong>Código:</strong> {resultado.codigo}</p>
            <p><strong>Estado:</strong> {resultado.estado}</p>
            {resultado.notas && <p><strong>Notas:</strong> {resultado.notas}</p>}
          </div>
        )}
      </div>
    </div>
  );
}