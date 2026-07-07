import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AuthGuard from "./components/auth/AuthGuard";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProfilePage from "./pages/settings/ProfilePage";
import ExpenseListPage from "./pages/expenses/ExpenseListPage";
import ExpenseFormPage from "./pages/expenses/ExpenseFormPage";
import ExpenseDetailPage from "./pages/expenses/ExpenseDetailPage";
import CategoryManagePage from "./pages/categories/CategoryManagePage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AuthGuard />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<div>Dashboard</div>} />
          <Route path="expenses" element={<ExpenseListPage />} />
          <Route path="expenses/new" element={<ExpenseFormPage />} />
          <Route path="expenses/:id" element={<ExpenseDetailPage />} />
          <Route path="expenses/:id/edit" element={<ExpenseFormPage />} />
          <Route path="categories" element={<CategoryManagePage />} />
          <Route path="budgets" element={<div>Budgets</div>} />
          <Route path="reports" element={<div>Reports</div>} />
          <Route path="settings" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
