import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

// Компоненты авторизации
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AuthGuard from './components/auth/AuthGuard';

// Основные компоненты
import MainLayout from './pages/MainLayout';
import TenantManagement from './components/admin/TenantManagement';
import AdminTickets from './components/admin/AdminTickets';
import ComputeVM from './components/sections/ComputeVM';
import ComputeImages from './components/sections/ComputeImages';
import ComputeBackups from './components/sections/ComputeBackups';
import StorageVolumes from './components/sections/StorageVolumes';
import StorageFiles from './components/sections/StorageFiles';
import StorageS3 from './components/sections/StorageS3';
import NetworkVPC from './components/sections/NetworkVPC';
import NetworkLB from './components/sections/NetworkLB';
import NetworkFirewall from './components/sections/NetworkFirewall';
import NetworkIP from './components/sections/NetworkIP';
import ManagementMonitoring from './components/sections/ManagementMonitoring';
import ManagementAudit from './components/sections/ManagementAudit';
import FinanceBalance from './components/sections/FinanceBalance';
import FinanceInvoices from './components/sections/FinanceInvoices';
import SupportKnowledge from './components/sections/SupportKnowledge';
import SupportTickets from './components/sections/SupportTickets';

// Модальные окна
import RegionModal from './components/Modals/RegionModal';
import NotificationsModal from './components/Modals/NotificationsModal';
import BalanceModal from './components/Modals/BalanceModal';
import UserMenuModal from './components/Modals/UserMenuModal';
import CreateVMModal from './components/Modals/CreateVMModal';
import EditVMModal from './components/Modals/EditVMModal';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }>
            {/* Редирект на виртуальные машины по умолчанию */}
            <Route index element={<Navigate to="/section/compute-vm" replace />} />
            
            {/* Админ маршруты */}
            <Route path="admin/tenants" element={<TenantManagement />} />
            <Route path="admin/tickets" element={<AdminTickets />} />
            
            {/* Основные разделы */}
            <Route path="section">
              <Route path="support-knowledge" element={<SupportKnowledge />} />
              <Route path="support-tickets" element={<SupportTickets />} />
              <Route path="compute-vm" element={<ComputeVM />} />
              <Route path="compute-images" element={<ComputeImages />} />
              <Route path="compute-backups" element={<ComputeBackups />} />
              <Route path="storage-volumes" element={<StorageVolumes />} />
              <Route path="storage-files" element={<StorageFiles />} />
              <Route path="storage-s3" element={<StorageS3 />} />
              <Route path="network-vpc" element={<NetworkVPC />} />
              <Route path="network-lb" element={<NetworkLB />} />
              <Route path="network-firewall" element={<NetworkFirewall />} />
              <Route path="network-ip" element={<NetworkIP />} />
              <Route path="management-monitoring" element={<ManagementMonitoring />} />
              <Route path="management-audit" element={<ManagementAudit />} />
              <Route path="finance-balance" element={<FinanceBalance />} />
              <Route path="finance-invoices" element={<FinanceInvoices />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Глобальные модальные окна */}
        <RegionModal />
        <NotificationsModal />
        <BalanceModal />
        <UserMenuModal />
        <CreateVMModal />
        <EditVMModal />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;