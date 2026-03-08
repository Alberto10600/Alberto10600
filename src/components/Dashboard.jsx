import { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Calendar, Target } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, getCategoryById } from '../data/categories';
import { formatCurrency, formatMonth, getCurrentMonth, getLast12Months, getMonthRange } from '../utils/format';
import './Dashboard.css';

// Custom tooltip shared style
const tooltipStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  fontSize: 13,
  color: '#f1f5f9',
};

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <p style={{ padding: '8px 12px 4px', fontWeight: 600, color: '#94a3b8', borderBottom: '1px solid #334155' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ padding: '4px 12px', color: p.color || '#f1f5f9' }}>
          {p.name}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{ ...tooltipStyle, padding: '8px 14px' }}>
      <p style={{ fontWeight: 600, color: p.payload.color }}>{p.name}</p>
      <p>{formatCurrency(p.value, currency)} ({p.payload.percent?.toFixed(1)}%)</p>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { state } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const months12 = getLast12Months();

  const { start, end } = getMonthRange(selectedMonth);
  const prevMonth = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonth]);
  const prevRange = getMonthRange(prevMonth);

  // Current month expenses
  const monthExpenses = useMemo(
    () => state.expenses.filter((e) => e.date >= start && e.date <= end),
    [state.expenses, start, end]
  );

  // Previous month
  const prevExpenses = useMemo(
    () => state.expenses.filter((e) => e.date >= prevRange.start && e.date <= prevRange.end),
    [state.expenses, prevRange]
  );

  const totalMonth = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalPrev = prevExpenses.reduce((s, e) => s + e.amount, 0);
  const pctChange = totalPrev > 0 ? ((totalMonth - totalPrev) / totalPrev) * 100 : 0;

  // By category (pie chart)
  const byCategory = useMemo(() => {
    const map = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([id, value]) => {
        const cat = getCategoryById(id);
        const total = monthExpenses.reduce((s, ex) => s + ex.amount, 0);
        return { name: cat.label, value, color: cat.color, icon: cat.icon, percent: total > 0 ? (value / total) * 100 : 0 };
      })
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses]);

  // Monthly trend (last 12 months)
  const monthlyTrend = useMemo(() => {
    return months12.map((m) => {
      const { start, end } = getMonthRange(m);
      const total = state.expenses
        .filter((e) => e.date >= start && e.date <= end)
        .reduce((s, e) => s + e.amount, 0);
      const label = formatMonth(m).split(' ')[0]; // just month name
      return { month: label, total, fullMonth: m };
    });
  }, [state.expenses, months12]);

  // Daily spending current month
  const dailyData = useMemo(() => {
    const map = {};
    monthExpenses.forEach((e) => {
      map[e.date] = (map[e.date] || 0) + e.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ day: date.slice(8), amount }));
  }, [monthExpenses]);

  // Category bar comparison (current vs previous month)
  const catComparison = useMemo(() => {
    const mapCurr = {};
    const mapPrev = {};
    monthExpenses.forEach((e) => { mapCurr[e.category] = (mapCurr[e.category] || 0) + e.amount; });
    prevExpenses.forEach((e) => { mapPrev[e.category] = (mapPrev[e.category] || 0) + e.amount; });

    const cats = new Set([...Object.keys(mapCurr), ...Object.keys(mapPrev)]);
    return Array.from(cats)
      .map((id) => {
        const cat = getCategoryById(id);
        return {
          name: cat.icon + ' ' + cat.label.split(' ')[0],
          actual: mapCurr[id] || 0,
          anterior: mapPrev[id] || 0,
          color: cat.color,
        };
      })
      .filter((d) => d.actual > 0 || d.anterior > 0)
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 8);
  }, [monthExpenses, prevExpenses]);

  const budgetPct = state.monthlyBudget > 0 ? Math.min((totalMonth / state.monthlyBudget) * 100, 100) : 0;
  const budgetColor = budgetPct > 90 ? 'var(--danger)' : budgetPct > 70 ? 'var(--warning)' : 'var(--success)';

  const topExpense = monthExpenses.reduce((max, e) => (!max || e.amount > max.amount ? e : max), null);

  return (
    <div className="dashboard animate-in">
      {/* Month Selector */}
      <div className="dash-header">
        <div>
          <h2 className="dash-title">Dashboard</h2>
          <p className="dash-sub">{formatMonth(selectedMonth)}</p>
        </div>
        <select
          className="input"
          style={{ width: 'auto', minWidth: 160 }}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months12.map((m) => (
            <option key={m} value={m}>{formatMonth(m)}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <DollarSign size={22} color="var(--accent)" />
          </div>
          <div>
            <p className="stat-label">Gasto total del mes</p>
            <p className="stat-value">{formatCurrency(totalMonth, state.currency)}</p>
            {totalPrev > 0 && (
              <p className={`stat-change ${pctChange > 0 ? 'up' : 'down'}`}>
                {pctChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {' '}{Math.abs(pctChange).toFixed(1)}% vs mes anterior
              </p>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <ShoppingBag size={22} color="var(--success)" />
          </div>
          <div>
            <p className="stat-label">Número de gastos</p>
            <p className="stat-value">{monthExpenses.length}</p>
            <p className="stat-change" style={{ color: 'var(--text-muted)' }}>
              Promedio: {formatCurrency(monthExpenses.length > 0 ? totalMonth / monthExpenses.length : 0, state.currency)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <Calendar size={22} color="var(--warning)" />
          </div>
          <div>
            <p className="stat-label">Gasto más alto</p>
            <p className="stat-value">{topExpense ? formatCurrency(topExpense.amount, state.currency) : '—'}</p>
            <p className="stat-change" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              {topExpense?.description || 'Sin datos'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <Target size={22} color="var(--danger)" />
          </div>
          <div style={{ flex: 1 }}>
            <p className="stat-label">Presupuesto mensual</p>
            {state.monthlyBudget > 0 ? (
              <>
                <p className="stat-value" style={{ color: budgetColor }}>
                  {budgetPct.toFixed(0)}%
                </p>
                <div className="budget-bar-track">
                  <div className="budget-bar-fill" style={{ width: `${budgetPct}%`, background: budgetColor }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {formatCurrency(totalMonth, state.currency)} / {formatCurrency(state.monthlyBudget, state.currency)}
                </p>
              </>
            ) : (
              <p className="stat-change" style={{ color: 'var(--text-muted)' }}>
                <button className="inline-link" onClick={() => onNavigate?.('settings')}>Configurar presupuesto</button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="charts-row">
        {/* Pie chart by category */}
        <div className="card chart-card">
          <p className="section-title">Gasto por categoría</p>
          {byCategory.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <span style={{ fontSize: 32 }}>📊</span>
              <p>Sin gastos este mes</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {byCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip currency={state.currency} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {byCategory.slice(0, 6).map((c) => (
                  <div key={c.name} className="pie-legend-item">
                    <div className="pie-legend-dot" style={{ background: c.color }} />
                    <span className="pie-legend-name">{c.icon} {c.name.split(' ')[0]}</span>
                    <span className="pie-legend-pct">{c.percent.toFixed(1)}%</span>
                    <span className="pie-legend-val">{formatCurrency(c.value, state.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Area chart monthly trend */}
        <div className="card chart-card">
          <p className="section-title">Tendencia últimos 12 meses</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={(props) => <CustomTooltip {...props} currency={state.currency} />} />
              <Area
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="charts-row">
        {/* Daily spending */}
        <div className="card chart-card">
          <p className="section-title">Gasto diario del mes</p>
          {dailyData.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <span style={{ fontSize: 32 }}>📅</span>
              <p>Sin datos diarios</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={(props) => <CustomTooltip {...props} currency={state.currency} />} />
                <Bar dataKey="amount" name="Gasto" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category comparison bar chart */}
        <div className="card chart-card">
          <p className="section-title">Comparación vs mes anterior</p>
          {catComparison.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <span style={{ fontSize: 32 }}>📈</span>
              <p>Sin datos para comparar</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={catComparison} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={(props) => <CustomTooltip {...props} currency={state.currency} />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="actual" name="Este mes" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="anterior" name="Mes anterior" fill="var(--border)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="card">
        <p className="section-title">Detalle por categoría</p>
        {byCategory.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <span style={{ fontSize: 28 }}>📋</span>
            <p>Sin gastos para mostrar</p>
          </div>
        ) : (
          <div className="cat-table">
            {byCategory.map((c) => (
              <div key={c.name} className="cat-row">
                <span className="cat-icon">{c.icon}</span>
                <div className="cat-info">
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{ width: `${c.percent}%`, background: c.color }} />
                  </div>
                </div>
                <span className="cat-pct">{c.percent.toFixed(1)}%</span>
                <span className="cat-val">{formatCurrency(c.value, state.currency)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
