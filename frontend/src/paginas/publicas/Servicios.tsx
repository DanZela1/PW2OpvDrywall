import { useEffect, useState } from 'react';
import { api } from '../../api/cliente';
import type { RespuestaLista } from '../../tipos';
import imagen1 from '../../../../assets/imagen1.jpg';
import imagen3 from '../../../../assets/imagen3.jpg';
import imagen7 from '../../../../assets/imagen7.jpg';
import imagen8 from '../../../../assets/imagen8.jpg';
import imagen9 from '../../../../assets/imagen9.jpg';
import imagen11 from '../../../../assets/imagen11.jpg';
import imagen12 from '../../../../assets/imagen12.jpg';

// Forma de cada servicio que devuelve GET /servicios
interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
}

// Lista de respaldo (nuestrosProgramas.html): se muestra mientras carga la API o si la API no responde
const SERVICIOS_BASE: Servicio[] = [
  {
    id: 1,
    nombre: 'Estructura Residencial',
    descripcion:
      'Construcción del armazón principal de viviendas, incluyendo paredes, techos y pisos. Proporciona la base estructural que da forma y soporte a toda la casa.',
  },
  {
    id: 2,
    nombre: 'Estructura Comercial',
    descripcion:
      'Enfocada en armado estructural de edificios destinados a uso comercial, como oficinas o tiendas, haciendo uso de materiales y técnicas adaptadas a mayores dimensiones y exigencias de seguridad.',
  },
  {
    id: 3,
    nombre: 'Aislamiento',
    descripcion:
      'Instalación de materiales para regular temperatura interior, mejoran la eficiencia energética y reducen el ruido. Esencial para mantener el confort y disminuir el consumo de energía.',
  },
  {
    id: 4,
    nombre: 'Paneles de Yeso',
    descripcion:
      'Colocación de paneles de yeso sobre estructuras metálicas o de madera para formar paredes y techos interiores.',
  },
  {
    id: 5,
    nombre: 'Revestimiento de Paredes',
    descripcion:
      'Sellado y alisado de las uniones entre paneles de yeso que prepara las superficies para pintura o decoración.',
  },
  {
    id: 6,
    nombre: 'Techado',
    descripcion:
      'Incluye la instalación y reparación de cubiertas que protegen las edificaciones de la lluvia, el sol y otros elementos climáticos. Un buen techado garantiza durabilidad, aislamiento y seguridad estructural.',
  },
];

// La API no guarda imágenes: cada servicio conocido se relaciona con su foto por el nombre
const IMAGENES: Record<string, string> = {
  'estructura residencial': imagen7,
  'estructura comercial': imagen8,
  aislamiento: imagen11,
  'paneles de yeso': imagen12,
  'revestimiento de paredes': imagen9,
  techado: imagen3,
};

// Un servicio nuevo (creado por el administrador) sin foto asignada usa una imagen por defecto
const imagenDe = (nombre: string): string => IMAGENES[nombre.trim().toLowerCase()] ?? imagen1;

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>(SERVICIOS_BASE);

  // _programas.less espera la clase "body-np" en <body>, como en el sitio estático
  useEffect(() => {
    document.body.classList.add('body-np');
    return () => document.body.classList.remove('body-np');
  }, []);

  // Los servicios activos salen de la API; si falla, se queda la lista de respaldo
  useEffect(() => {
    let montado = true;
    api
      .get<RespuestaLista<Servicio>>('/servicios', { params: { activo: true, limite: 50 } })
      .then(({ data }) => {
        // La API los devuelve del más nuevo al más antiguo: se ordenan como en el sitio estático
        if (montado && data.datos.length > 0) setServicios([...data.datos].sort((a, b) => a.id - b.id));
      })
      .catch(() => undefined);
    return () => {
      montado = false;
    };
  }, []);

  return (
    <>
      <section className="caja-np">
        <h1 className="h1-np">Nuestros Programas</h1>
      </section>

      <section className="t-contenedor">
        <div className="carta-holder grid">
          <div className="row">
            {servicios.map((s) => (
              <div key={s.id} className="col-12 col-m-6 col-l-4 mb-4">
                <div className="carta">
                  <div className="card-top">
                    <img src={imagenDe(s.nombre)} alt={s.nombre} />
                  </div>
                  <div className="card-middle">
                    <strong>{s.nombre}</strong>
                    <div className="c-descripcion">{s.descripcion}</div>
                  </div>
                  <div className="card-bottom" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}