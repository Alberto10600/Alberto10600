import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ExpenseContext = createContext(null);

const STORAGE_KEY = 'expense_tracker_data';

const initialState = {
  expenses: [],
  currency: 'USD',
  monthlyBudget: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload };

    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [
          { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() },
          ...state.expenses,
        ],
      };

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        ),
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };

    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };

    case 'SET_BUDGET':
      return { ...state, monthlyBudget: action.payload };

    default:
      return state;
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) };
  } catch {
    // ignore parse errors
  }
  return initialState;
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadFromStorage);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addExpense = (data) => dispatch({ type: 'ADD_EXPENSE', payload: data });
  const updateExpense = (data) => dispatch({ type: 'UPDATE_EXPENSE', payload: data });
  const deleteExpense = (id) => dispatch({ type: 'DELETE_EXPENSE', payload: id });
  const setCurrency = (c) => dispatch({ type: 'SET_CURRENCY', payload: c });
  const setBudget = (b) => dispatch({ type: 'SET_BUDGET', payload: b });

  return (
    <ExpenseContext.Provider value={{ state, addExpense, updateExpense, deleteExpense, setCurrency, setBudget }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpenses = () => useContext(ExpenseContext);
