// ============================================================================
//  Aviso legal / derechos de autor
// ============================================================================
const ANIO = new Date().getFullYear();

export const AVISO_LEGAL =
  `© ${ANIO} Jacobo Payero. Todos los derechos reservados. Queda prohibida la ` +
  `reproducción total o parcial de esta aplicación. Cualquier duplicidad o ` +
  `similitud puede conllevar sanciones penales y civiles.`;

export default function PieLegal({ estilo }) {
  return (
    <p
      style={{
        textAlign: "center",
        fontSize: "0.7rem",
        lineHeight: 1.5,
        color: "var(--tinta-suave)",
        margin: "18px 8px 4px",
        ...estilo,
      }}
    >
      {AVISO_LEGAL}
    </p>
  );
}
