import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { Settings2, Layers, Layout, Activity, Info, Download, Flame, ChevronRight, Plus, Minus, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';
import { RCSection, CONCRETE_CLASSES, STEEL_CLASSES, generateInteractionDiagram, calculateMN } from './logic/rcCalc';

const INITIAL_SECTION: RCSection = {
  width: 300,
  height: 500,
  concreteClass: 'C25/30',
  steelClass: 'B450C',
  fck: 25,
  fyk: 450,
  gammaC: 1.5,
  gammaS: 1.15,
  alphaCC: 0.85,
  topBars: 2,
  topBarDiam: 16,
  bottomBars: 3,
  bottomBarDiam: 20,
  sideBars: 0,
  sideBarDiam: 12,
  cover: 40,
};


export default function App() {

  const [section, setSection] = useState<RCSection>(INITIAL_SECTION);
  const [activeTab, setActiveTab] = useState<'params' | 'graphics' | 'table'>('params');

  const diagram = useMemo(() => generateInteractionDiagram(section), [section]);

  const updateSection = (updates: Partial<RCSection>) => {
    setSection(prev => {
      const next = { ...prev, ...updates };
      // Sync fck/fyk if class changes
      if (updates.concreteClass) {
        const found = CONCRETE_CLASSES.find(c => c.name === updates.concreteClass);
        if (found) next.fck = found.fck;
      }
      if (updates.steelClass) {
        const found = STEEL_CLASSES.find(c => c.name === updates.steelClass);
        if (found) next.fyk = found.fyk;
      }
      return next;
    });
  };

  const fcd = (section.alphaCC * section.fck) / section.gammaC;
  const fyd = section.fyk / section.gammaS;

  return (
    <div className="flex flex-col h-screen bg-[#0F1115] text-slate-200 font-sans overflow-hidden">
    
      {/* Header */}
      <header className="h-16 shrink-0 bg-[#1A1D23] border-b border-slate-700 px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded flex items-center justify-center font-bold text-white">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white leading-none">RC-Domain Analyzer</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">NTC2018 / Eurocode 2</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-1 bg-[#0F1115] p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('graphics')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'graphics' ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Layout className="w-3.5 h-3.5" />
              Grafico
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'table' ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Tabella
            </button>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition-all shadow-lg active:scale-95"
          >
            <Download className="w-4 h-4" />
            Report PDF
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar: Input Panel */}
        <aside className="w-80 shrink-0 border-r border-slate-700 bg-[#16191E] flex flex-col p-6 overflow-y-auto gap-8 shadow-inner">
          <section className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800 pb-2 flex items-center gap-2">
              <Layout className="w-3.5 h-3.5" />
              Geometria Sezione
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Base (b)" unit="mm" value={section.width} min={100} step={10} onChange={v => updateSection({ width: v })} />
              <InputGroup label="Altezza (h)" unit="mm" value={section.height} min={100} step={10} onChange={v => updateSection({ height: v })} />
            </div>
            <InputGroup label="Copriferro" unit="mm" value={section.cover} min={20} step={5} onChange={v => updateSection({ cover: v })} />
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800 pb-2 flex items-center gap-2">
              <Flame className="w-3.5 h-3.5" />
              Materiali
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Classe Calcestruzzo</label>
                <select
                  className="w-full bg-[#0F1115] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                  value={section.concreteClass}
                  onChange={e => updateSection({ concreteClass: e.target.value })}
                >
                  {CONCRETE_CLASSES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-800/50">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">fcd</p>
                  <p className="text-sm font-mono font-bold text-blue-400">{fcd.toFixed(2)} <span className="text-[10px]">MPa</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">fyd</p>
                  <p className="text-sm font-mono font-bold text-orange-400">{fyd.toFixed(0)} <span className="text-[10px]">MPa</span></p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Classe Acciaio</label>
                <select
                  className="w-full bg-[#0F1115] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors"
                  value={section.steelClass}
                  onChange={e => updateSection({ steelClass: e.target.value })}
                >
                  {STEEL_CLASSES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800 pb-2 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5" />
              Reinforcement
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InputGroup label="Sup. (n)" unit="" value={section.topBars} min={2} step={1} onChange={v => updateSection({ topBars: v })} />
                <InputGroup label="Sup. (φ)" unit="mm" value={section.topBarDiam} min={8} step={2} onChange={v => updateSection({ topBarDiam: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputGroup label="Inf. (n)" unit="" value={section.bottomBars} min={2} step={1} onChange={v => updateSection({ bottomBars: v })} />
                <InputGroup label="Inf. (φ)" unit="mm" value={section.bottomBarDiam} min={8} step={2} onChange={v => updateSection({ bottomBarDiam: v })} />
              </div>
            </div>
          </section>

          <div className="mt-auto p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-[10px] text-blue-400 uppercase font-bold tracking-tight">Parametri Normativi</p>
            </div>
            <div className="flex justify-between text-[11px] text-blue-300 font-mono opacity-80">
              <span>γc = {section.gammaC.toFixed(2)}</span>
              <span>γs = {section.gammaS.toFixed(2)}</span>
              <span>αcc = {section.alphaCC.toFixed(2)}</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden space-y-8 bg-[#0F1115]">

          <div className="flex flex-col lg:flex-row gap-8 min-h-[500px]">

            {/* Diagram Panel */}
            <div className="flex-[3] bg-[#16191E] rounded-2xl border border-slate-700 p-8 flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    Dominio di Resistenza M-N
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Ultimate Limit State (ULS) / Stato Limite Ultimo</p>
                </div>
                <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-blue-500">ULS Domain</span>
                  <span className="text-slate-600">Serviceability (Mock)</span>
                </div>
              </div>

              <div className="flex-1 min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D333D" vertical={false} />
                    <XAxis
                      type="number"
                      dataKey="M"
                      name="Momento"
                      unit=" kNm"
                      stroke="#64748B"
                      fontSize={10}
                      tick={{ fontFamily: 'JetBrains Mono' }}
                      label={{ value: 'M [kNm]', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#64748B', fontWeight: 'bold' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="N"
                      name="Sforzo Normale"
                      unit=" kN"
                      stroke="#64748B"
                      fontSize={10}
                      tick={{ fontFamily: 'JetBrains Mono' }}
                      label={{ value: 'N [kN]', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748B', fontWeight: 'bold' }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: '#475569' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1A1D23] text-slate-200 p-4 rounded-xl shadow-2xl border border-slate-700 text-xs backdrop-blur-sm">
                              <p className="font-bold mb-3 text-blue-400 uppercase tracking-widest text-[10px]">Stato Sollecitazione</p>
                              <div className="space-y-2">
                                <div className="flex justify-between gap-4 font-mono">
                                  <span className="text-slate-500 italic">Normale Nrd:</span>
                                  <span className="font-bold text-white tracking-tighter">{data.N.toFixed(1)} kN</span>
                                </div>
                                <div className="flex justify-between gap-4 font-mono">
                                  <span className="text-slate-500 italic">Momento Mrd:</span>
                                  <span className="font-bold text-white tracking-tighter">{data.M.toFixed(1)} kNm</span>
                                </div>
                                <div className="h-px bg-slate-700 my-2"></div>
                                <div className="flex justify-between gap-4 font-mono">
                                  <span className="text-slate-500 italic">εc (top):</span>
                                  <span className="font-bold text-orange-400">{(data.epsC * 1000).toFixed(2)} ‰</span>
                                </div>
                                <div className="flex justify-between gap-4 font-mono">
                                  <span className="text-slate-500 italic">εs1 (bot):</span>
                                  <span className="font-bold text-emerald-400">{(data.epsS1 * 100).toFixed(2)} %</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      name="MN Curve"
                      data={diagram}
                      fill="#3B82F6"
                      line={{ stroke: '#3B82F6', strokeWidth: 2 }}
                      shape={() => null}
                    />
                    <Scatter
                      data={[{ M: 0, N: diagram[0]?.N || 0 }, { M: 0, N: diagram[diagram.length - 1]?.N || 0 }]}
                      line={{ stroke: '#2D333D', strokeDasharray: '5 5' }}
                      shape={() => null}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Results Column */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-[#16191E] rounded-2xl border border-slate-700 p-6 flex flex-col shadow-lg transition-transform hover:scale-[1.02]">
                <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-blue-500" />
                  Risultati Sezione
                </h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-tight">NRd Max (Comp.)</p>
                    <p className="text-3xl font-light font-mono text-white tracking-tighter">
                      {Math.max(...diagram.map(p => p.N)).toFixed(1)}
                      <span className="text-xs text-slate-500 ml-1">kN</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-tight">MRd Max (Fless.)</p>
                    <p className="text-2xl font-light font-mono text-white tracking-tighter">
                      {Math.max(...diagram.map(p => p.M)).toFixed(1)}
                      <span className="text-xs text-slate-500 ml-1">kNm</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#16191E] rounded-2xl border border-slate-700 p-6 flex-1 shadow-lg">
                <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-6 flex items-center gap-2">
                  <Info className="w-3 h-3 text-orange-500" />
                  Geometria & Armatura
                </h4>
                <div className="space-y-4">
                  <DataRow label="Area As (Inf)" value={`${(section.bottomBars * Math.PI * Math.pow(section.bottomBarDiam / 2, 2) / 100).toFixed(2)} cm²`} />
                  <DataRow label="Area As' (Sup)" value={`${(section.topBars * Math.PI * Math.pow(section.topBarDiam / 2, 2) / 100).toFixed(2)} cm²`} />
                  <DataRow label="Rapporto Geo." value={`${((section.topBars * Math.PI * Math.pow(section.topBarDiam / 2, 2) + section.bottomBars * Math.PI * Math.pow(section.bottomBarDiam / 2, 2)) / (section.width * section.height) * 100).toFixed(2)} %`} />

                  <div className="mt-8 pt-4 border-t border-slate-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        Il calcolo assume comportamento perfettamente plastico per l'acciaio e parabola-rettangolo per il cls (NTC2018).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Table Area */}
          <div className="bg-[#16191E] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#1A1D23] border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dataset Punti di Rottura (SLU)</h3>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 italic">Campione ogni 5 step</span>
                <Download className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-white" />
              </div>
            </div>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0F1115]/50 sticky top-0 backdrop-blur-md">
                  <tr className="text-[10px] uppercase text-slate-500 font-bold border-b border-slate-800">
                    <th className="px-6 py-3">Point ID</th>
                    <th className="px-6 py-3">NRd [kN]</th>
                    <th className="px-6 py-3">MRd [kNm]</th>
                    <th className="px-6 py-3">εc (top) [‰]</th>
                    <th className="px-6 py-3">εs (bot) [%]</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {diagram.filter((_, i) => i % 5 === 0).map((pt, i) => (
                    <tr key={i} className="hover:bg-blue-900/5 transition-colors group">
                      <td className="px-6 py-2.5 text-slate-600 group-hover:text-slate-400 italic">SLU_{i < 10 ? '0' + i : i}</td>
                      <td className={cn("px-6 py-2.5 font-bold", pt.N >= 0 ? "text-blue-400" : "text-red-400")}>{pt.N.toFixed(2)}</td>
                      <td className="px-6 py-2.5 font-bold text-slate-300">{pt.M.toFixed(2)}</td>
                      <td className="px-6 py-2.5 text-orange-500">{(pt.epsC! * 1000).toFixed(2)}</td>
                      <td className="px-6 py-2.5 text-emerald-500">{(pt.epsS1! * 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function InputGroup({ label, unit, value, onChange, min, step }: { label: string, unit: string, value: number, onChange: (v: number) => void, min: number, step: number }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex justify-between items-center">
        {label}
        {unit && <span className="text-[9px] lowercase font-normal italic opacity-50">[{unit}]</span>}
      </label>
      <div className="relative group">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-[#0F1115] border border-slate-700 rounded px-3 py-2 text-sm font-bold text-white focus:border-blue-500 focus:outline-none transition-all pr-12"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onChange(value + step)} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
          <button onClick={() => onChange(Math.max(min, value - step))} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/50 last:border-0 group">
      <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors italic">{label}</span>
      <span className="text-sm font-bold text-slate-300 font-mono tracking-tighter">{value}</span>
    </div>
  )
}
