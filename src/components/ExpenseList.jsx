import { useState, useMemo } from 'react';
import { Trash2, Pencil, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, PAYMENT_METHODS, getCategoryById } from '../data/categories';
import { formatCurrency, formatDate } from '../utils/format';
import ExpenseForm from './ExpenseForm';
import './ExpenseList.css';

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Fecha (reciente)' },
  { value: 'date_asc', label: 'Fecha (antigua)' },
  { value: 'amount_desc', label: 'Monto (mayor)' },
  { value: 'amount_asc', label: 'Monto (menor)' },
];

export default function ExpenseList({ showToast }) {
  const { state, deleteExpense } = useExpenses();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [editExpense, setEditExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [monthFilter, setMonthFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const months = useMemo(() => {
    const seen = new Set();
    state.expenses.forEach((e) => {
      const m = e.date?.slice(0, 7);
      if (m) seen.add(m);
    });
    return Array.from(seen).sort().reverse();
  }, [state.expenses]);

  const filtered = useMemo(() => {
    let list = [...state.expenses];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          getCategoryById(e.category)?.label.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter((e) => e.category === categoryFilter);
    }

    if (monthFilter !== 'all') {
      list = list.filter((e) => e.date?.startsWith(monthFilter));
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc': return a.date?.localeCompare(b.date);
        case 'amount_desc': return b.amount - a.amount;
        case 'amount_asc': return a.amount - b.amount;
        default: return b.date?.localeCompare(a.date);
      }
    });

    return list;
  }, [state.expenses, search, categoryFilter, sortBy, monthFilter]);

  const paged = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > paged.length;
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este gasto?')) {
      deleteExpense(id);
      showToast('Gasto eliminado', 'error');
    }
  };

  return (
    <div className="expense-list-page animate-in">
      {/* Header */}
      <div className="el-header">
        <div>
          <h2 className="el-title">Mis Gastos</h2>
          <p className="el-subtitle">{filtered.length} registros · Total: {formatCurrency(total, state.currency)}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters((v) => !v)}>
          <Filter size={15} />
          Filtros
          {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Search bar */}
      <div className="el-search">
        <Search size={16} className="el-search-icon" />
        <input
          className="input"
          placeholder="Buscar por descripción o categoría..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="el-filters card animate-in">
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Categoría</label>
              <select className="input" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                <option value="all">Todas las categorías</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Mes</label>
              <select className="input" value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}>
                <option value="all">Todos los meses</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Ordenar por</label>
              <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <span style={{ fontSize: 40 }}>🔍</span>
          <p>No se encontraron gastos</p>
          <span>Intenta cambiar los filtros de búsqueda</span>
        </div>
      ) : (
        <div className="el-list">
          {paged.map((expense) => {
            const cat = getCategoryById(expense.category);
            return (
              <div key={expense.id} className="el-item card">
                <div className="el-item-cat" style={{ background: cat.color + '22', color: cat.color }}>
                  <span>{cat.icon}</span>
                </div>
                <div className="el-item-info">
                  <p className="el-item-desc">{expense.description}</p>
                  <div className="el-item-meta">
                    <span className="el-cat-badge" style={{ background: cat.color + '22', color: cat.color }}>
                      {cat.label}
                    </span>
                    <span className="el-date">{formatDate(expense.date)}</span>
                    {expense.notes && <span className="el-notes" title={expense.notes}>📝</span>}
                  </div>
                </div>
                <div className="el-item-right">
                  <p className="el-amount">{formatCurrency(expense.amount, state.currency)}</p>
                  <div className="el-actions">
                    <button className="btn-icon" onClick={() => setEditExpense(expense)} title="Editar">
                      <Pencil size={15} />
                    </button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(expense.id)} title="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => setPage((p) => p + 1)}>
              Ver más ({filtered.length - paged.length} restantes)
            </button>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editExpense && (
        <ExpenseForm
          editData={editExpense}
          onClose={() => setEditExpense(null)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}
    </div>
  );
}
