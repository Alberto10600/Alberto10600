import { useState, useEffect } from 'react';
import { X, DollarSign, Tag, Calendar, FileText, CreditCard } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../data/categories';
import { useExpenses } from '../context/ExpenseContext';

const today = () => new Date().toISOString().slice(0, 10);

const empty = {
  amount: '',
  category: 'food',
  description: '',
  date: today(),
  paymentMethod: 'cash',
  notes: '',
};

export default function ExpenseForm({ onClose, onSuccess, editData = null }) {
  const { addExpense, updateExpense, state } = useExpenses();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (editData) {
      setForm({
        amount: editData.amount,
        category: editData.category,
        description: editData.description,
        date: editData.date,
        paymentMethod: editData.paymentMethod || 'cash',
        notes: editData.notes || '',
      });
    }
  }, [editData]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return;
    if (!form.description.trim()) return;

    const data = { ...form, amount: parseFloat(form.amount) };

    if (editData) {
      updateExpense({ ...editData, ...data });
      onSuccess?.('Gasto actualizado');
    } else {
      addExpense(data);
      onSuccess?.('Gasto registrado');
      setForm({ ...empty, date: today() });
    }

    onClose?.();
  };

  const isModal = !!onClose;

  const formContent = (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label><DollarSign size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Monto *</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={set('amount')}
            required
            autoFocus={!editData}
          />
        </div>
        <div className="form-group">
          <label><Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Fecha *</label>
          <input
            className="input"
            type="date"
            value={form.date}
            onChange={set('date')}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label><FileText size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Descripción *</label>
        <input
          className="input"
          type="text"
          placeholder="¿En qué gastaste?"
          value={form.description}
          onChange={set('description')}
          required
          maxLength={120}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label><Tag size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Categoría *</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label><CreditCard size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Método de pago</label>
          <select className="input" value={form.paymentMethod} onChange={set('paymentMethod')}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Notas (opcional)</label>
        <textarea
          className="input"
          rows={2}
          placeholder="Notas adicionales..."
          value={form.notes}
          onChange={set('notes')}
          style={{ resize: 'vertical', minHeight: 60 }}
          maxLength={300}
        />
      </div>

      {isModal ? (
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">
            {editData ? 'Actualizar gasto' : 'Registrar gasto'}
          </button>
        </div>
      ) : (
        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
          Registrar gasto
        </button>
      )}
    </form>
  );

  if (isModal) {
    return (
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-title">
            <span>{editData ? '✏️' : '➕'}</span>
            {editData ? 'Editar gasto' : 'Nuevo gasto'}
            <button className="btn-icon" style={{ marginLeft: 'auto' }} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>➕ Registrar gasto</h2>
      {formContent}
    </div>
  );
}
