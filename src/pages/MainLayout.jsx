import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import RegionModal from '../components/Modals/RegionModal';
import NotificationsModal from '../components/Modals/NotificationsModal';
import BalanceModal from '../components/Modals/BalanceModal';
import UserMenuModal from '../components/Modals/UserMenuModal';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard">
          <Outlet />
        </div>
      </div>
      
      {/* Модальные окна */}
      <RegionModal />
      <NotificationsModal />
      <BalanceModal />
      <UserMenuModal />
    </div>
  );
};

export default MainLayout;