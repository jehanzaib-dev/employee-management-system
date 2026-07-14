import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './bootstrap';
import '../css/app.css';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import UserForm from './pages/Admin/UserForm';
import UserList from './pages/Admin/UserList';
import DepartmentForm from './pages/Departments/DepartmentForm';
import DepartmentList from './pages/Departments/DepartmentList';
import Dashboard from './pages/Dashboard';
import EmployeeForm from './pages/Employees/EmployeeForm';
import EmployeeList from './pages/Employees/EmployeeList';
import Login from './pages/Login';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/employees" element={<EmployeeList />} />
                            <Route path="/employees/new" element={<EmployeeForm />} />
                            <Route path="/employees/:id/edit" element={<EmployeeForm />} />
                            <Route path="/departments" element={<DepartmentList />} />
                            <Route path="/departments/new" element={<DepartmentForm />} />
                            <Route path="/departments/:id/edit" element={<DepartmentForm />} />
                            <Route element={<AdminRoute />}>
                                <Route path="/admin/users" element={<UserList />} />
                                <Route path="/admin/users/new" element={<UserForm />} />
                                <Route path="/admin/users/:id/edit" element={<UserForm />} />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

createRoot(document.getElementById('app')).render(<App />);
