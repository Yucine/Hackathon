import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const UserMenuModal = () => {
  const { modals, closeModal, showToast, showConfirmDialog } = useApp();
  const { currentUser, logout } = useAuth();

  if (!modals.userMenu) return null;

  const handleAction = (action) => {
    closeModal('userMenu');
    
    switch(action) {
      case 'profile':
        showToast('📋 Открыт профиль пользователя', 'info');
        break;
      case 'settings':
        showToast('⚙️ Настройки аккаунта', 'info');
        break;
      case '2fa':
        showToast('🔐 Настройка двухфакторной аутентификации', 'info');
        break;
      case 'support':
        showToast('💬 Открыт чат с поддержкой', 'info');
        break;
      case 'docs':
        showToast('📚 Документация', 'info');
        break;
      case 'logout':
        showConfirmDialog(
          'Выход из системы',
          'Вы действительно хотите выйти?',
          'fa-sign-out-alt',
          () => {
            logout();
            showToast('👋 До свидания!', 'info');
            window.location.href = '/login';
          }
        );
        break;
    }
  };

  return (
    <div className="modal-overlay active" onClick={() => closeModal('userMenu')}>
      <div className="modal-content user-menu-modal" onClick={e => e.stopPropagation()}>
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid var(--mts-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, var(--mts-red-light) 0%, #ffffff 100%)'
        }}>
          <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
            {currentUser?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>{currentUser?.fullName || 'Пользователь'}</div>
            <div style={{ fontSize: '12px', color: 'var(--mts-gray)' }}>{currentUser?.email}</div>
            <div style={{ fontSize: '11px', color: 'var(--mts-red)', marginTop: '4px' }}>
              {currentUser?.company || 'Частное лицо'}
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="user-menu-item" onClick={() => handleAction('profile')}>
            <i className="fas fa-user"></i> Мой профиль
          </div>
          <div className="user-menu-item" onClick={() => handleAction('settings')}>
            <i className="fas fa-cog"></i> Настройки
          </div>
          <div className="user-menu-item" onClick={() => handleAction('2fa')}>
            <i className="fas fa-shield-alt"></i> Двухфакторная аутентификация
          </div>
          <div className="user-menu-divider"></div>
          <div className="user-menu-item" onClick={() => handleAction('support')}>
            <i className="fas fa-headset"></i> Поддержка
          </div>
          <div className="user-menu-item" onClick={() => handleAction('docs')}>
            <i className="fas fa-book"></i> Документация
          </div>
          <div className="user-menu-divider"></div>
          <div className="user-menu-item" onClick={() => handleAction('logout')}>
            <i className="fas fa-sign-out-alt"></i> Выйти
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMenuModal;