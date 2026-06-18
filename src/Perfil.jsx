// ============================================================================
//  MENTE SERENA — Mi perfil y ficha clínica (historia médica)
//
//  El paciente edita su nombre, su foto y su ficha clínica.
//  SALVAGUARDA: la ficha NO pide peso, IMC, calorías ni medidas corporales.
//  Recoge contexto seguro (alergias, condiciones, contacto de emergencia…).
// ============================================================================
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Camera, ShieldCheck, User } from "lucide-react";
import { miPerfil, actualizarMiPerfil, getFichaClinica, guardarFichaClinica } from "./api";
import { CamposFicha, CAMPOS_FICHA } from "./CamposFicha.jsx";

// Lee una imagen y la reduce a ~256px (data-URL JPEG) para no pesar.
function comprimirImagen(file, max = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * escala);
        const h = Math.round(img.height * escala);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function iniciales(nombre) {
  return (nombre || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
}

export function VistaPerfil({ irA, alActualizar }) {
  const [perfil, setPerfil] = useState(null);
  const [nombre, setNombre] = useState("");
  const [foto, setFoto] = useState("");
  const [ficha, setFicha] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const inputFoto = useRef();

  useEffect(() => {
    miPerfil().then((p) => {
      setPerfil(p);
      setNombre(p?.nombre || "");
      setFoto(p?.foto_url || "");
    });
    getFichaClinica().then((f) => setFicha(f || {})).catch(console.error);
  }, []);

  function setF(k, v) {
    setFicha((prev) => ({ ...prev, [k]: v }));
  }

  async function elegirFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await comprimirImagen(file);
      setFoto(dataUrl);
    } catch (err) {
      console.error(err);
    }
  }

  async function guardar() {
    setGuardando(true);
    try {
      await actualizarMiPerfil({ nombre: nombre.trim(), foto_url: foto });
      const payload = { antecedentes: ficha.antecedentes || [] };
      CAMPOS_FICHA.forEach((c) => {
        payload[c.k] = ficha[c.k] || (c.tipo === "date" ? null : "");
      });
      await guardarFichaClinica(payload);
      setOk(true);
      setTimeout(() => setOk(false), 2500);
      alActualizar && alActualizar();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <header className="encabezado">
        <button
          onClick={() => irA("inicio")}
          style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--salvia-osc)", fontWeight: 600, marginBottom: 6 }}
        >
          <ChevronLeft size={18} /> Inicio
        </button>
        <p className="saludo">Tu información</p>
        <h1 style={{ marginTop: 0 }}>Mi perfil</h1>
      </header>

      {/* Foto + nombre */}
      <div className="tarjeta" style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <button
            onClick={() => inputFoto.current?.click()}
            style={{ position: "relative", borderRadius: "50%" }}
            title="Cambiar foto"
          >
            {foto ? (
              <img
                src={foto}
                alt="Mi foto"
                style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--salvia-clara)" }}
              />
            ) : (
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  background: "var(--salvia)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 700,
                }}
              >
                {iniciales(nombre)}
              </div>
            )}
            <span
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                background: "var(--salvia-osc)",
                color: "#fff",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
              }}
            >
              <Camera size={16} />
            </span>
          </button>
          <input ref={inputFoto} type="file" accept="image/*" onChange={elegirFoto} style={{ display: "none" }} />
        </div>

        <div className="campo" style={{ textAlign: "left" }}>
          <label>¿Cómo te llamas?</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
        </div>
      </div>

      {/* Ficha clínica */}
      <div className="seccion-titulo">
        <ShieldCheck size={15} /> Mi ficha clínica
      </div>

      <div className="aviso" style={{ background: "#eef1ea", borderColor: "var(--salvia-clara)" }}>
        <div className="titulo" style={{ color: "var(--salvia-osc)" }}>
          <User size={18} /> Para que tu equipo te cuide mejor
        </div>
        <p>
          Comparte solo lo que quieras. Tu equipo de cuidado puede verlo. Aquí no se piden
          peso, medidas ni cifras corporales.
        </p>
      </div>

      <div className="tarjeta">
        <CamposFicha ficha={ficha} setF={setF} />

        <button className="btn" onClick={guardar} disabled={guardando} style={{ marginTop: 8 }}>
          {ok ? "Guardado 🌿" : guardando ? "Guardando…" : "Guardar mi perfil"}
        </button>
      </div>
    </>
  );
}
