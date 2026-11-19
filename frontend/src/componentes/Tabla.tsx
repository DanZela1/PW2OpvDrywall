import type { ReactNode } from 'react';

// Tabla de administración: encabezados, filas y mensaje cuando no hay datos. Se desplaza en horizontal en pantallas angostas.
// Cada fila lleva una clave única (el id del registro) y sus celdas ya armadas por la pantalla.
export interface Fila {
  clave: string | number;
  celdas: ReactNode[];
}

const celda: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #ddd' };

export default function Tabla({ columnas, filas, vacio }: { columnas: string[]; filas: Fila[]; vacio: string }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{columnas.map((c) => <th key={c} style={celda}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {filas.length === 0 && (
            <tr><td style={celda} colSpan={columnas.length}>{vacio}</td></tr>
          )}
          {filas.map((f) => (
            <tr key={f.clave}>
              {f.celdas.map((contenido, i) => <td key={i} style={celda}>{contenido}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}