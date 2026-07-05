import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AddDishPage from './pages/AddDishPage';
import EditDishPage from './pages/EditDishPage';
import DishDetail from './pages/DishDetail';
import MealPlanPage from './pages/MealPlanPage';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
        <div className="min-h-screen bg-bg dark:bg-bg-dark transition-colors">
          <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <main className="w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/add" element={<AddDishPage />} />
              <Route path="/dish/:id" element={<DishDetail />} />
              <Route path="/dish/:id/edit" element={<EditDishPage />} />
              <Route path="/meal-plan" element={<MealPlanPage sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
