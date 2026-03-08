import { LayoutDashboard, List, PlusCircle, Settings, Wallet } from 'lucide-react';
import './Navbar.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Gastos', icon: List },
  { id: 'add', label: 'Agregar', icon: PlusCircle, highlight: true },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

export default function Navbar({ active, onChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Wallet size={22} className="navbar-logo" />
        <span>GastosPro</span>
      </div>
      <div className="navbar-items">
        {NAV_ITEMS.map(({ id, label, icon: Icon, highlight }) => (
          <button
            key={id}
            className={`nav-item ${active === id ? 'nav-item--active' : ''} ${highlight ? 'nav-item--highlight' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
