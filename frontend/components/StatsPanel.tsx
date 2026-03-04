'use client';

interface StatsPanelProps {
  stats: {
    total: number;
    p0: number;
    p1: number;
    p2: number;
    active: number;
    interviews: number;
    offers: number;
  };
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="border-b border-steel-800/60 bg-steel-900/30">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="grid grid-cols-7 gap-4">
          <div className="stat-card">
            <div className="text-steel-400 text-xs font-mono mb-1">TOTAL</div>
            <div className="text-2xl font-mono font-bold text-steel-100">{stats.total}</div>
          </div>
          
          <div className="stat-card border-l-2 border-l-red-500/50">
            <div className="text-red-400/70 text-xs font-mono mb-1">P0 // URGENT</div>
            <div className="text-2xl font-mono font-bold text-red-400">{stats.p0}</div>
          </div>
          
          <div className="stat-card border-l-2 border-l-amber-500/50">
            <div className="text-amber-400/70 text-xs font-mono mb-1">P1 // HIGH</div>
            <div className="text-2xl font-mono font-bold text-amber-400">{stats.p1}</div>
          </div>
          
          <div className="stat-card border-l-2 border-l-steel-500/50">
            <div className="text-steel-400/70 text-xs font-mono mb-1">P2 // NORMAL</div>
            <div className="text-2xl font-mono font-bold text-steel-400">{stats.p2}</div>
          </div>
          
          <div className="stat-card border-l-2 border-l-blue-500/50">
            <div className="text-blue-400/70 text-xs font-mono mb-1">ACTIVE</div>
            <div className="text-2xl font-mono font-bold text-blue-400">{stats.active}</div>
          </div>
          
          <div className="stat-card border-l-2 border-l-emerald-500/50">
            <div className="text-emerald-400/70 text-xs font-mono mb-1">INTERVIEWS</div>
            <div className="text-2xl font-mono font-bold text-emerald-400">{stats.interviews}</div>
          </div>
          
          <div className="stat-card border-l-2 border-l-purple-500/50">
            <div className="text-purple-400/70 text-xs font-mono mb-1">OFFERS</div>
            <div className="text-2xl font-mono font-bold text-purple-400">{stats.offers}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
