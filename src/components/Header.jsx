import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { 
    currentRegion, 
    balance, 
    unreadCount,
    openModal,
    isAdmin 
  } = useApp();
  
  const { currentUser } = useAuth();

  // Получаем инициалы пользователя
  const getUserInitials = () => {
    if (currentUser?.fullName) {
      return currentUser.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return currentUser?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (currentUser?.fullName) {
      const names = currentUser.fullName.split(' ');
      return names.length > 1 ? `${names[0]} ${names[1][0]}.` : names[0];
    }
    return currentUser?.email?.split('@')[0] || 'Пользователь';
  };

  const getUserRole = () => {
    if (isAdmin) return 'Администратор';
    return currentUser?.position || 'Пользователь';
  };

  return (
    <div className="header">
      <div className="search-global">
        <i className="fas fa-search"></i>
        <input type="text" placeholder="Поиск ресурсов (VM, IP, диски...)" />
      </div>
      
      <div className="header-right">
        <div className="region-badge" onClick={() => openModal('region')}>
          <i className="fas fa-map-marker-alt"></i> 
          <span>{currentRegion}</span>
          <i className="fas fa-chevron-down" style={{ marginLeft: '6px', fontSize: '10px' }}></i>
        </div>

        <div className="notifications" onClick={() => openModal('notifications')}>
          <i className="far fa-bell"></i>
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </div>

        {/* Показываем баланс только для обычных пользователей */}
        {!isAdmin && balance !== undefined && (
          <div className="balance-pill" onClick={() => openModal('balance')}>
            <i className="fas fa-coins"></i> 
            <span>{balance.toFixed(2)}</span> ₽
          </div>
        )}

        {/* Для админа показываем другой индикатор */}
        {isAdmin && (
          <div className="balance-pill" style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)' }}>
            <i className="fas fa-crown"></i> 
            <span>Админ</span>
          </div>
        )}

        <div className="user-profile" onClick={() => openModal('userMenu')}>
          <div className="avatar">{getUserInitials()}</div>
          <div className="user-info">
            <span className="user-name">{getUserDisplayName()}</span>
            <span className="user-role">{getUserRole()}</span>
          </div>
          <i className="fas fa-chevron-down" style={{ fontSize: '12px' }}></i>
        </div>
      </div>
    </div>
  );
};

export default Header;