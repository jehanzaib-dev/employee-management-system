import axios from 'axios';

const client = axios.create({
    baseURL: '/',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
    },
});

export async function login(credentials) {
    await client.get('/sanctum/csrf-cookie');

    return client.post('/api/login', credentials);
}

export async function logout() {
    return client.post('/api/logout');
}

export async function fetchCurrentUser() {
    return client.get('/api/user');
}

export async function fetchDashboardStats() {
    return client.get('/api/dashboard');
}

export async function fetchDepartments() {
    return client.get('/api/departments');
}

export async function fetchDepartment(id) {
    return client.get(`/api/departments/${id}`);
}

export async function createDepartment(department) {
    return client.post('/api/departments', department);
}

export async function updateDepartment(id, department) {
    return client.put(`/api/departments/${id}`, department);
}

export async function deleteDepartment(id) {
    return client.delete(`/api/departments/${id}`);
}

export async function fetchEmployees(params = {}) {
    return client.get('/api/employees', { params });
}

export async function fetchEmployee(id) {
    return client.get(`/api/employees/${id}`);
}

export async function createEmployee(employee) {
    return client.post('/api/employees', employee);
}

export async function updateEmployee(id, employee) {
    return client.put(`/api/employees/${id}`, employee);
}

export async function deleteEmployee(id) {
    return client.delete(`/api/employees/${id}`);
}

export async function uploadEmployeePhoto(id, file) {
    const formData = new FormData();
    formData.append('photo', file);

    return client.post(`/api/employees/${id}/photo`, formData);
}

export async function removeEmployeePhoto(id) {
    return client.delete(`/api/employees/${id}/photo`);
}

export default client;
