import { useState } from 'react';
import { Settings as SettingsIcon, DollarSign, Trash2, Download, Upload } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CURRENCIES } from '../data/categories';
import { formatCurrency } from '../utils/format';

export default function Settings({ showToast }) {
  const { state, setCurrency, setBudget, deleteExpense } = useExpenses();
  const [budget, setBudgetLocal] = useState(state.monthlyBudget || '');
  const [confirmClear, setConfirmClear] = useState(false);

  const handleBudget = (e) => {
    e.preventDefault();
    const val = parseFloat(budget);
    if (!isNaN(val) && val >= 0) {
      setBudget(val);
      showToast('Presupuesto actualizado', 'success');
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Datos exportados', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.expenses) {
          localStorage.setItem('expense_tracker_data', ev.target.result);
          window.location.reload();
        } else {
          showToast('Archivo inválido', 'error');
        }
      } catch {
        showToast('Error al importar', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    state.expenses.forEach((e) => deleteExpense(e.id));
    setConfirmClear(false);
    showToast('Todos los gastos eliminados', 'error');
  };

  const totalAll = state.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Ajustes</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Configuración de tu cuenta y preferencias</p>
      </div>

      {/* Stats summary */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: 16, display: 'block' }}>Resumen general</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{state.expenses.length}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total gastos</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(totalAll, state.currency)}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total acumulado</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>{state.currency}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Moneda</p>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: 16, display: 'block', fontSize: 15 }}>
          <DollarSign size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Moneda
        </p>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Selecciona tu moneda</label>
          <select
            className="input"
            value={state.currency}
            onChange={(e) => { setCurrency(e.target.value); showToast('Moneda actualizada', 'success'); }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: 16, display: 'block', fontSize: 15 }}>
          🎯 Presupuesto mensual
        </p>
        <form onSubmit={handleBudget}>
          <div className="form-group">
            <label>Monto del presupuesto (en {state.currency})</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 2000.00"
              value={budget}
              onChange={(e) => setBudgetLocal(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Guardar presupuesto</button>
        </form>
      </div>

      {/* Export / Import */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: 16, display: 'block', fontSize: 15 }}>
          📁 Exportar / Importar datos
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={handleExport}>
            <Download size={16} />
            Exportar JSON
          </button>
          <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            Importar JSON
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
          Exporta tus datos como backup o impórtalos desde otro dispositivo.
        </p>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: 'var(--danger)' }}>
        <p className="section-title" style={{ marginBottom: 12, display: 'block', fontSize: 15, color: 'var(--danger)' }}>
          ⚠️ Zona peligrosa
        </p>
        {!confirmClear ? (
          <button className="btn btn-danger" onClick={() => setConfirmClear(true)}>
            <Trash2 size={15} />
            Eliminar todos los gastos
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>¿Estás seguro? Esta acción no se puede deshacer.</p>
            <button className="btn btn-danger" onClick={handleClearAll}>Sí, eliminar todo</button>
            <button className="btn btn-ghost" onClick={() => setConfirmClear(false)}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}
