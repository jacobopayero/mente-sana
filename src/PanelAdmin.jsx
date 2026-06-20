// ============================================================================
//  AURA — Panel de Administración / Central (HQ)
//  Para el rol 'admin' (médico/dirección que coordina toda la red).
//  Vista interconectada: profesionales, pacientes, referidos y teleconsultas.
// ============================================================================
import { useEffect, useState } from "react";
import { LogOut, Stethoscope, Users, Share2, PhoneCall, Network } from "lucide-react";
import { cerrarSesion, panoramaAdmin } from "./api";
import { Teleconsulta } from "./Teleconsulta.jsx";
import PieLegal from "./PieLegal.jsx";

const ROL_LABEL = { terapeuta: "Terapeuta", psiquiatra: "Psiquiatra", admin: "Dirección" };

const fecha = (iso) => {
  if (!iso) return "";
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00");
  return d.toLocaleDateString("es-DO", { day: "numeric", month: "short" });
};

function Metrica({ icono: Icono, valor, texto }) {
  return (
    <div className="tarjeta" style={{ flex: 1, textAlign: "center", padding: 14, marginBottom: 0 }}>
      <Icono size={20} color="var(--salvia)" style={{ margin: "0 auto 4px", display: "block" }} />
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--salvia-osc)" }}>{valor}</div>
      <div className="meta">{texto}</div>
    </div>
  );
}

export default function PanelAdmin({ perfil, alSalir }) {
  const [d, setD] = useState(null);

  useEffect(() => {
    panoramaAdmin().then(setD).catch(console.error);
  }, []);

  async function salir() {
    await cerrarSesion();
    await alSalir();
  }

  return (
    <div className="app">
      <div className="banner-demo" style={{ background: "var(--salvia-osc)", color: "#fff" }}>
        Central · Administración (HQ)
      </div>

      <div className="contenido" style={{ paddingBottom: 24 }}>
        <header className="encabezado">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p className="saludo">Dirección</p>
              <h1>{perfil.nombre}</h1>
            </div>
            <button style={{ padding: 8 }} onClick={salir} title="Cerrar sesión">
              <LogOut size={20} color="var(--tinta-suave)" />
            </button>
          </div>
        </header>

        {!d ? (
          <p className="cargando">Cargando…</p>
        ) : (
          <>
            <div className="aviso" style={{ background: "#eef1ea", borderColor: "var(--salvia-clara)" }}>
              <div className="titulo" style={{ color: "var(--salvia-osc)" }}>
                <Network size={18} /> Red interconectada
              </div>
              <p>Coordinación de toda la red de cuidado: profesionales, pacientes, referidos y teleconsultas.</p>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <Metrica icono={Stethoscope} valor={d.profesionales.length} texto="Profesionales" />
              <Metrica icono={Users} valor={d.pacientes.length} texto="Pacientes" />
              <Metrica icono={Share2} valor={d.referidos.length} texto="Referidos" />
              <Metrica icono={PhoneCall} valor={d.teleconsultas.length} texto="Consultas" />
            </div>

            {/* Profesionales */}
            <div className="seccion-titulo">
              <Stethoscope size={15} /> Profesionales de la red
            </div>
            <div className="tarjeta">
              {d.profesionales.map((p) => (
                <div className="item" key={p.id}>
                  <div className="avatar" style={{ width: 40, height: 40 }}>
                    {(p.nombre || "?").split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div className="cuerpo">
                    <div className="titulo">{p.nombre}</div>
                    <div className="meta">{ROL_LABEL[p.rol] || "Profesional"}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pacientes */}
            <div className="seccion-titulo">
              <Users size={15} /> Pacientes
            </div>
            <div className="tarjeta">
              {d.pacientes.map((p) => (
                <div className="item" key={p.id}>
                  <div className="cuerpo">
                    <div className="titulo">{p.nombre}</div>
                    <div className="meta">{p.email}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Referidos */}
            <div className="seccion-titulo">
              <Share2 size={15} /> Referidos
            </div>
            <div className="tarjeta">
              {d.referidos.length === 0 ? (
                <p className="vacio" style={{ padding: 8 }}>Sin referidos.</p>
              ) : (
                d.referidos.map((r) => (
                  <div className="item" key={r.id} style={{ display: "block" }}>
                    <div className="titulo" style={{ fontWeight: 600 }}>{r.paciente_nombre}</div>
                    <div className="meta">
                      {r.referido_por_nombre || "—"} → {r.hacia_nombre || "—"} · {fecha(r.fecha)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Teleconsulta */}
            <Teleconsulta />
          </>
        )}

        <PieLegal />
      </div>
    </div>
  );
}
