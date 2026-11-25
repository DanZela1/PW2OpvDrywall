// Mensaje de error bajo un campo de formulario. La clase "error" viene de _registro.less y está oculta
// por defecto, por eso se fuerza display:block solo cuando hay texto. Si no hay texto, no dibuja nada.
export default function ErrorCampo({ id, texto }: { id: string; texto?: string | undefined }) {
  return texto ? (
    <span className="error" id={id} style={{ display: 'block' }}>
      {texto}
    </span>
  ) : null;
}