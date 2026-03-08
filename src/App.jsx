import { useState } from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import { useToast } from './hooks/useToast';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Settings from './components/Settings';
import Toast from './components/Toast';
import './App.css';

function AppContent() {
  const [page, setPage] = useState('dashboard');
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="app">
      <Navbar active={page} onChange={(p) => setPage(p)} />
      <main className="main-content">
        <div className="page-container">
          {page === 'dashboard' && <Dashboard onNavigate={(p) => setPage(p)} />}
          {page === 'expenses' && <ExpenseList showToast={showToast} />}
          {page === 'add' && (
            <ExpenseForm
              onSuccess={(msg) => { showToast(msg, 'success'); setPage('expenses'); }}
            />
          )}
          {page === 'settings' && <Settings showToast={showToast} />}
        </div>
      </main>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}
