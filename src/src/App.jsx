import { useState, useEffect } from "react";

const GOLD = "#C9A84C";
const NAVY = "#0D1B2A";
const TEAL = "#2EC4B6";
const RED = "#DC2626";
const GREEN = "#16A34A";
const ORANGE = "#F59E0B";
const LIGHT = "#F8F7F4";

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Slider({ label, value, onChange, min, max, step, format, icon, sub }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "1.6rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "0.8rem", color: "#6B7280", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY, fontFamily: "'DM Serif Display', Georgia, serif" }}>
          {format(value)}
        </span>
      </div>
      {sub && <div style={{ fontSize: "0.72rem", color: "#9CA3AF", marginBottom: "0.3rem" }}>{sub}</div>}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", height: "6px", appearance: "none", borderRadius: "3px",
          background: `linear-gradient(to right, ${TEAL} 0%, ${GOLD} ${pct}%, #E5E7EB ${pct}%, #E5E7EB 100%)`,
          cursor: "pointer", outline: "none" }} />
    </div>
  );
}

function TimelineChart({ dataAcum, dataDecum, idadeAtual, idadeAposent, idadeFim, rendaMensal, metaOk }) {
  const w = 440, h = 200, pad = 45;
  const allData = [...dataAcum, ...dataDecum.slice(1)];
  const maxVal = Math.max(...allData, 1);
  const totalYears = idadeFim - idadeAtual;
  const anosAcum = idadeAposent - idadeAtual;

  const toX = (i) => pad + (i / totalYears) * (w - pad * 2);
  const toY = (v) => h - pad - (v / maxVal) * (h - pad * 2);

  const pathAcum = dataAcum.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
  const areaAcum = pathAcum + ` L${toX(anosAcum)},${h - pad} L${toX(0)},${h - pad} Z`;

  const pathDecum = dataDecum.map((v, i) => `${i === 0 ? "M" : "L"}${toX(anosAcum + i)},${toY(v)}`).join(" ");
  const areaDecum = pathDecum + ` L${toX(anosAcum + dataDecum.length - 1)},${h - pad} L${toX(anosAcum)},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: "460px" }}>
      <defs>
        <linearGradient id="gAcum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TEAL} stopOpacity="0.3" />
          <stop offset="100%" stopColor={TEAL} stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="gDecum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.25" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = pad + (h - pad * 2) * (1 - pct);
        const val = maxVal * pct;
        return (
          <g key={i}>
            <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#E5E7EB" strokeWidth="0.5" />
            <text x={pad - 4} y={y + 3} textAnchor="end" fontSize="6.5" fill="#9CA3AF" fontFamily="DM Sans">
              {val >= 1e6 ? `${(val/1e6).toFixed(1)}M` : `${(val/1e3).toFixed(0)}k`}
            </text>
          </g>
        );
      })}

      {/* Retirement line */}
      <line x1={toX(anosAcum)} y1={pad - 5} x2={toX(anosAcum)} y2={h - pad} stroke={GOLD} strokeWidth="1.5" strokeDasharray="4,3" />
      <text x={toX(anosAcum)} y={pad - 10} textAnchor="middle" fontSize="7" fill={GOLD} fontFamily="DM Sans" fontWeight="600">
        APOSENTADORIA
      </text>

      {/* Age labels */}
      {[idadeAtual, idadeAposent, idadeFim].map((age, i) => {
        const yearIdx = age - idadeAtual;
        return (
          <text key={i} x={toX(yearIdx)} y={h - pad + 14} textAnchor="middle" fontSize="7" fill="#6B7280" fontFamily="DM Sans" fontWeight="600">
            {age} anos
          </text>
        );
      })}

      {/* Areas */}
      <path d={areaAcum} fill="url(#gAcum)" />
      {dataDecum.length > 1 && <path d={areaDecum} fill="url(#gDecum)" />}

      {/* Lines */}
      <path d={pathAcum} fill="none" stroke={TEAL} strokeWidth="2.5" />
      {dataDecum.length > 1 && <path d={pathDecum} fill="none" stroke={GOLD} strokeWidth="2.5" />}

      {/* Peak dot */}
      <circle cx={toX(anosAcum)} cy={toY(dataAcum[anosAcum])} r="5" fill={TEAL} stroke="white" strokeWidth="2" />

      {/* Phase labels */}
      <text x={toX(anosAcum / 2)} y={h - pad - 8} textAnchor="middle" fontSize="7" fill={TEAL} fontFamily="DM Sans" fontWeight="600" opacity="0.7">
        ACUMULAÇÃO
      </text>
      {dataDecum.length > 3 && (
        <text x={toX(anosAcum + (dataDecum.length - 1) / 2)} y={h - pad - 8} textAnchor="middle" fontSize="7" fill={GOLD} fontFamily="DM Sans" fontWeight="600" opacity="0.7">
          RENDA
        </text>
      )}
    </svg>
  );
}

function StatusBadge({ status, text }) {
  const colors = {
    ok: { bg: "#F0FDF4", border: GREEN, text: GREEN, icon: "✅" },
    warn: { bg: "#FFFBEB", border: ORANGE, text: ORANGE, icon: "⚠️" },
    danger: { bg: "#FEF2F2", border: RED, text: RED, icon: "🚨" },
  };
  const c = colors[status];
  return (
    <div style={{ background: c.bg, border: `2px solid ${c.border}30`, borderRadius: "12px", padding: "1rem", textAlign: "center", marginBottom: "1rem" }}>
      <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>{c.icon}</div>
      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: c.text, fontFamily: "'DM Sans', sans-serif" }}>{text}</div>
    </div>
  );
}

export default function App() {
  const [idadeAtual, setIdadeAtual] = useState(35);
  const [idadeAposent, setIdadeAposent] = useState(60);
  const [patrimonioAtual, setPatrimonioAtual] = useState(200000);
  const [aporteMensal, setAporteMensal] = useState(3000);
  const [rendaDesejada, setRendaDesejada] = useState(10000);
  const [retornoAcum, setRetornoAcum] = useState(10);
  const [retornoDecum, setRetornoDecum] = useState(6);
  const [inflacao, setInflacao] = useState(4.5);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => { setTimeout(() => setShowCTA(true), 4000); }, []);

  // Cálculos
  const anosAcum = Math.max(idadeAposent - idadeAtual, 1);
  const retRealAcum = (retornoAcum - inflacao) / 100;
  const retRealDecum = (retornoDecum - inflacao) / 100;
  const retMensalAcum = Math.pow(1 + retRealAcum, 1/12) - 1;
  const retMensalDecum = Math.pow(1 + retRealDecum, 1/12) - 1;

  // Fase de acumulação
  const dataAcum = [patrimonioAtual];
  let acum = patrimonioAtual;
  for (let a = 1; a <= anosAcum; a++) {
    for (let m = 0; m < 12; m++) {
      acum = acum * (1 + retMensalAcum) + aporteMensal;
    }
    dataAcum.push(acum);
  }
  const patrimonioAposent = acum;

  // Renda mensal que o patrimônio gera (regra dos 4% adaptada)
  const rendaMensalGerada = retMensalDecum > 0
    ? patrimonioAposent * retMensalDecum / (1 - Math.pow(1 + retMensalDecum, -360))
    : patrimonioAposent / 360;

  // Fase de decumulação (sacando rendaDesejada por mês)
  const dataDecum = [patrimonioAposent];
  let decum = patrimonioAposent;
  let anosRenda = 0;
  const maxAnosDecum = 50;
  for (let a = 1; a <= maxAnosDecum; a++) {
    for (let m = 0; m < 12; m++) {
      decum = decum * (1 + retMensalDecum) - rendaDesejada;
      if (decum <= 0) { decum = 0; break; }
    }
    dataDecum.push(Math.max(decum, 0));
    anosRenda = a;
    if (decum <= 0) break;
  }

  const idadeFim = Math.min(idadeAposent + anosRenda, idadeAposent + maxAnosDecum);
  const totalInvestido = patrimonioAtual + aporteMensal * 12 * anosAcum;
  const rendimentoTotal = patrimonioAposent - totalInvestido;
  const metaOk = rendaMensalGerada >= rendaDesejada;
  const pctMeta = Math.min((rendaMensalGerada / rendaDesejada) * 100, 999);
  const dinheiroAcabaIdade = decum <= 0 ? idadeAposent + anosRenda : null;

  let status, statusText;
  if (pctMeta >= 100) {
    status = "ok";
    statusText = `Parabéns! Seu plano gera ${fmt(rendaMensalGerada)}/mês — ${pctMeta.toFixed(0)}% da sua meta. O dinheiro ${anosRenda >= 50 ? "não acaba" : `dura até os ${idadeFim} anos`}.`;
  } else if (pctMeta >= 70) {
    status = "warn";
    statusText = `Quase lá! Seu plano gera ${fmt(rendaMensalGerada)}/mês — faltam ${fmt(rendaDesejada - rendaMensalGerada)}/mês. ${dinheiroAcabaIdade ? `O dinheiro acaba aos ${dinheiroAcabaIdade} anos.` : ""}`;
  } else {
    status = "danger";
    statusText = `Atenção: seu plano gera apenas ${fmt(rendaMensalGerada)}/mês — ${pctMeta.toFixed(0)}% da meta. ${dinheiroAcabaIdade ? `O dinheiro acaba aos ${dinheiroAcabaIdade} anos.` : ""} Vamos ajustar?`;
  }

  return (
    <div style={{ minHeight: "100vh", background: LIGHT, fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", margin: 0, padding: 0 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${LIGHT}; }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: ${NAVY}; border: 3px solid ${GOLD}; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: transform 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        input[type="range"]::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 50%; border: 3px solid ${GOLD};
          background: ${NAVY}; cursor: pointer;
        }
      `}</style>

      {/* Header */}
      <div style={{ width: "100%", background: NAVY, padding: "1.2rem 1rem", textAlign: "center", borderBottom: `3px solid ${GOLD}` }}>
        <div style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", marginBottom: "0.3rem", fontWeight: 600 }}>
          Gabriel Investe — Consultoria Independente — CVM
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "white", fontSize: "clamp(1.3rem, 4vw, 1.8rem)", margin: 0, fontWeight: 400 }}>
          Simulador de Aposentadoria
        </h1>
        <p style={{ color: "#9CA3AF", fontSize: "0.8rem", margin: "0.3rem 0 0" }}>
          Descubra se o seu plano financeiro vai te dar a liberdade que você merece
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: "900px", padding: "1.5rem 1rem", display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        {/* Inputs */}
        <div style={{ background: "white", borderRadius: "16px", padding: "1.8rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)", border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "4px", height: "24px", background: GOLD, borderRadius: "2px" }} />
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: NAVY, letterSpacing: "0.04em", textTransform: "uppercase" }}>Seu Perfil</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
            <Slider label="Idade Atual" value={idadeAtual} onChange={setIdadeAtual}
              min={18} max={65} step={1} icon="🎂" format={(v) => `${v} anos`} />
            <Slider label="Aposentar aos" value={idadeAposent} onChange={(v) => setIdadeAposent(Math.max(v, idadeAtual + 1))}
              min={40} max={80} step={1} icon="🏖️" format={(v) => `${v} anos`} />
          </div>

          <Slider label="Patrimônio Atual" value={patrimonioAtual} onChange={setPatrimonioAtual}
            min={0} max={5000000} step={10000} icon="💰" format={fmt} sub="Quanto você já tem investido" />
          <Slider label="Aporte Mensal" value={aporteMensal} onChange={setAporteMensal}
            min={0} max={50000} step={500} icon="📥" format={fmt} sub="Quanto investe por mês" />
          <Slider label="Renda Mensal Desejada" value={rendaDesejada} onChange={setRendaDesejada}
            min={2000} max={50000} step={500} icon="🎯" format={fmt} sub="Quanto quer receber por mês na aposentadoria (em reais de hoje)" />

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ width: "4px", height: "24px", background: TEAL, borderRadius: "2px" }} />
            <h2 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: NAVY, letterSpacing: "0.04em", textTransform: "uppercase" }}>Premissas</h2>
          </div>

          <Slider label="Retorno Anual (Acumulação)" value={retornoAcum} onChange={setRetornoAcum}
            min={6} max={18} step={0.5} icon="📈" format={(v) => `${v.toFixed(1)}%`} sub="Retorno bruto durante fase de investimento" />
          <Slider label="Retorno Anual (Aposentadoria)" value={retornoDecum} onChange={setRetornoDecum}
            min={3} max={12} step={0.5} icon="🛡️" format={(v) => `${v.toFixed(1)}%`} sub="Retorno mais conservador na fase de renda" />
          <Slider label="Inflação Anual" value={inflacao} onChange={setInflacao}
            min={2} max={10} step={0.5} icon="📊" format={(v) => `${v.toFixed(1)}%`} sub="IPCA projetado" />
        </div>

        {/* Results */}
        <div style={{ background: "white", borderRadius: "16px", padding: "1.8rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)", border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.2rem" }}>
            <div style={{ width: "4px", height: "24px", background: TEAL, borderRadius: "2px" }} />
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: NAVY, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Sua Projeção
            </h2>
          </div>

          {/* Status */}
          <StatusBadge status={status} text={statusText} />

          {/* Chart */}
          <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0" }}>
            <TimelineChart dataAcum={dataAcum} dataDecum={dataDecum} idadeAtual={idadeAtual}
              idadeAposent={idadeAposent} idadeFim={idadeFim} rendaMensal={rendaDesejada} metaOk={metaOk} />
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1.2rem", fontSize: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <div style={{ width: "16px", height: "3px", background: TEAL, borderRadius: "2px" }} />
              <span style={{ color: "#6B7280" }}>Acumulação</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <div style={{ width: "16px", height: "3px", background: GOLD, borderRadius: "2px" }} />
              <span style={{ color: "#6B7280" }}>Fase de renda</span>
            </div>
          </div>

          {/* Key metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
            <div style={{ background: `${TEAL}08`, borderRadius: "12px", padding: "1rem", border: `1px solid ${TEAL}20`, textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem", fontWeight: 600 }}>Patrimônio aos {idadeAposent} anos</div>
              <div style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)", fontWeight: 800, color: TEAL, fontFamily: "'DM Serif Display', serif" }}>{fmt(patrimonioAposent)}</div>
            </div>
            <div style={{ background: `${GOLD}10`, borderRadius: "12px", padding: "1rem", border: `1px solid ${GOLD}25`, textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem", fontWeight: 600 }}>Renda mensal gerada</div>
              <div style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)", fontWeight: 800, color: metaOk ? GREEN : RED, fontFamily: "'DM Serif Display', serif" }}>{fmt(rendaMensalGerada)}</div>
            </div>
          </div>

          {/* Detail stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1.2rem" }}>
            {[
              { label: "Total investido", value: fmt(totalInvestido), color: "#6B7280" },
              { label: "Rendimento", value: fmt(rendimentoTotal), color: TEAL },
              { label: "Anos investindo", value: `${anosAcum} anos`, color: NAVY },
              { label: "Dinheiro dura", value: anosRenda >= 50 ? "∞ (perpétuo)" : `${anosRenda} anos`, color: anosRenda >= 30 ? GREEN : RED },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: "center", padding: "0.5rem 0.2rem" }}>
                <div style={{ fontSize: "0.6rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.15rem" }}>{item.label}</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: "1.2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.3rem" }}>
              <span style={{ color: "#6B7280", fontWeight: 600 }}>Meta de renda: {fmt(rendaDesejada)}/mês</span>
              <span style={{ color: metaOk ? GREEN : RED, fontWeight: 700 }}>{Math.min(pctMeta, 100).toFixed(0)}%</span>
            </div>
            <div style={{ width: "100%", height: "10px", background: "#E5E7EB", borderRadius: "5px", overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(pctMeta, 100)}%`, height: "100%", borderRadius: "5px",
                background: metaOk ? `linear-gradient(90deg, ${TEAL}, ${GREEN})` : `linear-gradient(90deg, ${RED}, ${ORANGE})`,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* CTA */}
          <div style={{
            background: NAVY, borderRadius: "12px", padding: "1.5rem", textAlign: "center",
            opacity: showCTA ? 1 : 0, transform: showCTA ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.6s ease",
          }}>
            <div style={{ fontSize: "0.85rem", color: GOLD, fontWeight: 600, marginBottom: "0.5rem" }}>
              {metaOk ? "Seu plano está no caminho certo. Quer otimizar?" : "Quer ajustar seu plano para atingir a meta?"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#9CA3AF", marginBottom: "1rem", lineHeight: 1.5 }}>
              Faço um planejamento personalizado com Simulação Monte Carlo<br/>
              e Protocolo IRIS para otimizar sua carteira.<br/>
              15 anos de experiência. CVM registrado. Fee-only.
            </div>
            <a href={`https://wa.me/5541998817220?text=${encodeURIComponent(
              `Olá Gabriel! Usei o Simulador de Aposentadoria e quero um plano personalizado.\n\n` +
              `📊 Meus dados:\n` +
              `• Idade: ${idadeAtual} anos\n` +
              `• Aposentar aos: ${idadeAposent} anos\n` +
              `• Patrimônio atual: ${fmt(patrimonioAtual)}\n` +
              `• Aporte mensal: ${fmt(aporteMensal)}\n` +
              `• Renda desejada: ${fmt(rendaDesejada)}/mês\n\n` +
              `📈 Resultado da simulação:\n` +
              `• Patrimônio projetado: ${fmt(patrimonioAposent)}\n` +
              `• Renda mensal gerada: ${fmt(rendaMensalGerada)}\n` +
              `• Meta atingida: ${pctMeta.toFixed(0)}%\n\n` +
              `Gostaria de agendar uma conversa!`
            )}`} target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.85rem 2rem", textDecoration: "none",
                background: "#25D366",
                color: "white", fontWeight: 700, fontSize: "0.85rem",
                borderRadius: "8px", cursor: "pointer", letterSpacing: "0.04em",
                boxShadow: "0 4px 14px rgba(37,211,102,0.4)", transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              FALAR COM GABRIEL NO WHATSAPP
            </a>
            <div style={{ fontSize: "0.65rem", color: "#6B7280", marginTop: "0.8rem" }}>
              Seus dados da simulação já vão junto na mensagem
            </div>
            <div style={{ borderTop: "1px solid #ffffff15", marginTop: "0.8rem", paddingTop: "0.8rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
              <a href="https://www.instagram.com/gabrielinveste" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "0.72rem", color: GOLD, textDecoration: "none", fontWeight: 600 }}>
                📸 Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ fontSize: "0.65rem", color: "#9CA3AF", textAlign: "center", padding: "0.5rem 1rem", lineHeight: 1.6 }}>
          Este simulador é uma ferramenta educacional e não constitui recomendação de investimento.
          Projeções baseadas em premissas que podem não se concretizar. Resultados passados não garantem resultados futuros.
          Gabriel Investe — Consultoria Independente registrada na CVM.
        </div>
      </div>
    </div>
  );
}
