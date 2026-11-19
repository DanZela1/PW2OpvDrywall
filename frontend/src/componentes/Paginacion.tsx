// Botones Anterior / Siguiente para los listados de la API ({ total, pagina, limite, datos }).
interface Props {
  pagina: number;
  total: number;
  limite: number;
  etiqueta: string; // por ejemplo "clientes"
  onCambiar: (pagina: number) => void;
}

export default function Paginacion({ pagina, total, limite, etiqueta, onCambiar }: Props) {
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  return (
    <p style={{ marginTop: 15 }}>
      <button disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>Anterior</button>{' '}
      Página {pagina} de {totalPaginas} ({total} {etiqueta}){' '}
      <button disabled={pagina >= totalPaginas} onClick={() => onCambiar(pagina + 1)}>Siguiente</button>
    </p>
  );
}