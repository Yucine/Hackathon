import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const AdminPanel = () => {
  const { getAllUsers, getAllServers, getUserData } = useAuth();
  const { 
    openModal, 
    updateBalance, 
    startVM, 
    stopVM, 
    showToast,
    setSelectedUser,
    getUserDetails,
    allocateTraffic,
    createVM,
    deleteVM
  } = useApp();
  
  const [selectedTab, setSelectedTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [servers, setServers] = useState([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [userServers, setUserServers] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmIcon, setConfirmIcon] = useState('');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalServers: 0,
    totalCPU: 0,
    totalRAM: 0,
    totalDisk: 0,
    totalTraffic: 0
  });

  // Загружаем данные при монтировании
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = getAllUsers();
    const allServers = getAllServers();
    
    setUsers(allUsers);
    setServers(allServers);
    
    setStats({
      totalUsers: allUsers.length,
      totalServers: allServers.length,
      totalCPU: allServers.reduce((acc, s) => acc + (s.cpu || 0), 0),
      totalRAM: allServers.reduce((acc, s) => acc + (s.ram || 0), 0),
      totalDisk: allServers.reduce((acc, s) => acc + (s.disk || 0), 0),
      totalTraffic: allServers.reduce((acc, s) => acc + (s.traffic?.limit || 0), 0)
    });
  };

  const handleViewUser = (user) => {
    const details = getUserDetails(user.id);
    setSelectedUserDetails(details);
    setSelectedUser(user);
    
    const userServersList = servers.filter(s => s.userId === user.id);
    setUserServers(userServersList);
    
    setSelectedTab('userDetails');
  };

  const handleBackToUsers = () => {
    setSelectedUserDetails(null);
    setSelectedUser(null);
    setUserServers([]);
    setSelectedTab('users');
  };

  const showConfirm = (title, message, icon, action) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmIcon(icon);
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleAddFunds = (user) => {
    showConfirm(
      'Пополнение баланса',
      `Пополнить баланс пользователя ${user.email}?`,
      'fa-coins',
      () => {
        const amount = prompt('Введите сумму для пополнения (₽):', '1000');
        if (amount && !isNaN(amount) && parseInt(amount) > 0) {
          updateBalance(parseInt(amount), user.id);
          showToast(`✅ Баланс пользователя ${user.email} пополнен на ${amount} ₽`, 'success');
          setTimeout(loadData, 500);
        }
        setShowConfirmDialog(false);
      }
    );
  };

  const handleCreateVMForUser = (user) => {
    openModal('createVM', { userId: user.id });
  };

  const handleAllocateTraffic = (server) => {
    showConfirm(
      'Выделение трафика',
      `Выделить трафик для сервера ${server.name}?`,
      'fa-chart-line',
      () => {
        const amount = prompt('Введите объем трафика для выделения (GB):', '100');
        if (amount && !isNaN(amount) && parseInt(amount) > 0) {
          allocateTraffic(server.id, parseInt(amount), server.userId);
          showToast(`📊 Выделено ${amount} GB трафика для сервера ${server.name}`, 'success');
          setTimeout(loadData, 500);
        }
        setShowConfirmDialog(false);
      }
    );
  };

  const handleEditVM = (server) => {
    openModal('editVM', { vmId: server.id, userId: server.userId });
  };

  const handleStartVM = (server) => {
    showConfirm(
      'Запуск сервера',
      `Запустить сервер ${server.name}?`,
      'fa-play',
      () => {
        startVM(server.id, server.userId);
        showToast(`▶️ Сервер ${server.name} запущен`, 'success');
        setTimeout(loadData, 1000);
        setShowConfirmDialog(false);
      }
    );
  };

  const handleStopVM = (server) => {
    showConfirm(
      'Остановка сервера',
      `Остановить сервер ${server.name}?`,
      'fa-stop',
      () => {
        stopVM(server.id, server.userId);
        showToast(`⏸️ Сервер ${server.name} остановлен`, 'info');
        setTimeout(loadData, 1000);
        setShowConfirmDialog(false);
      }
    );
  };

  const handleDeleteVM = (server) => {
    showConfirm(
      '⚠️ Удаление сервера',
      `Удалить сервер ${server.name}? Это действие нельзя отменить.`,
      'fa-trash',
      () => {
        deleteVM(server.id, server.userId);
        showToast(`🗑️ Сервер ${server.name} удален`, 'warning');
        setTimeout(loadData, 500);
        if (selectedUserDetails) {
          setUserServers(prev => prev.filter(s => s.id !== server.id));
        }
        setShowConfirmDialog(false);
      }
    );
  };

  const handleRefresh = () => {
    loadData();
    showToast('🔄 Данные обновлены', 'success');
  };

  return (
    <div className="admin-panel">
      {/* Системное окно подтверждения в стиле МТС */}
      {showConfirmDialog && (
        <div className="modal-overlay active">
          <div className="modal-content confirm-dialog">
            <div className="confirm-header">
              <div className="confirm-icon">
                <i className={`fas ${confirmIcon}`}></i>
              </div>
              <h3>{confirmTitle}</h3>
            </div>
            <div className="modal-body">
              <p className="confirm-message">{confirmMessage}</p>
            </div>
            <div className="confirm-footer">
              <button 
                className="confirm-btn cancel" 
                onClick={() => setShowConfirmDialog(false)}
              >
                <i className="fas fa-times"></i> Отмена
              </button>
              <button 
                className="confirm-btn confirm" 
                onClick={confirmAction}
              >
                <i className="fas fa-check"></i> Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>
          <i className="fas fa-crown" style={{ color: 'var(--mts-red)', marginRight: '12px' }}></i>
          Панель администратора
        </h1>
        <button className="action-btn" onClick={handleRefresh}>
          <i className="fas fa-sync-alt"></i> Обновить
        </button>
      </div>

      {/* Статистика */}
      <div className="widget-grid" style={{ marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="card-title">
            <i className="fas fa-users"></i> Пользователи
          </div>
          <div className="balance-large">{stats.totalUsers}</div>
          <div className="stat-footer">
            <span className="view-all" onClick={() => setSelectedTab('users')}>
              Просмотреть →
            </span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="card-title">
            <i className="fas fa-server"></i> Серверы
          </div>
          <div className="balance-large">{stats.totalServers}</div>
          <div className="stat-footer">
            <span className="view-all" onClick={() => setSelectedTab('servers')}>
              Просмотреть →
            </span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="card-title">
            <i className="fas fa-microchip"></i> Всего vCPU
          </div>
          <div className="balance-large">{stats.totalCPU}</div>
        </div>
        <div className="card stat-card">
          <div className="card-title">
            <i className="fas fa-memory"></i> Всего RAM
          </div>
          <div className="balance-large">{stats.totalRAM} GB</div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${selectedTab === 'users' ? 'active' : ''}`}
          onClick={() => setSelectedTab('users')}
        >
          <i className="fas fa-users"></i> Пользователи
        </button>
        <button
          className={`tab-btn ${selectedTab === 'servers' ? 'active' : ''}`}
          onClick={() => setSelectedTab('servers')}
        >
          <i className="fas fa-server"></i> Все серверы ({servers.length})
        </button>
        {selectedTab === 'userDetails' && selectedUserDetails && (
          <button className="tab-btn active">
            <i className="fas fa-user"></i> {selectedUserDetails.user?.fullName || 'Пользователь'}
          </button>
        )}
      </div>

      {selectedTab === 'users' && (
        <div className="resources-section">
          <div className="resources-header">
            <h3>Список пользователей</h3>
            <span className="view-all" onClick={loadData}>
              <i className="fas fa-sync-alt"></i> Обновить
            </span>
          </div>
          
          {users.length > 0 ? (
            <table className="resource-table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Компания</th>
                  <th>Серверов</th>
                  <th>Баланс</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const userData = getUserData(user.id);
                  const userServersCount = servers.filter(s => s.userId === user.id).length;
                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.fullName || 'Не указано'}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.company || '-'}</td>
                      <td>
                        <span className="badge-count">{userServersCount}</span>
                      </td>
                      <td>
                        <span className="balance-amount">
                          {userData?.balance || 0} ₽
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="icon-btn" 
                            onClick={() => handleViewUser(user)}
                            title="Просмотр пользователя"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="icon-btn success" 
                            onClick={() => handleAddFunds(user)}
                            title="Пополнить баланс"
                          >
                            <i className="fas fa-coins"></i>
                          </button>
                          <button 
                            className="icon-btn primary" 
                            onClick={() => handleCreateVMForUser(user)}
                            title="Создать сервер"
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fas fa-users" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
              <p>Нет зарегистрированных пользователей</p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'servers' && (
        <div className="resources-section">
          <div className="resources-header">
            <h3>Все серверы системы ({servers.length})</h3>
            <span className="view-all" onClick={loadData}>
              <i className="fas fa-sync-alt"></i> Обновить
            </span>
          </div>
          
          {servers.length > 0 ? (
            <table className="resource-table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Владелец</th>
                  <th>Статус</th>
                  <th>IP</th>
                  <th>Конфигурация</th>
                  <th>ОС</th>
                  <th>Трафик</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {servers.map(server => (
                  <tr key={server.id}>
                    <td>
                      <strong>{server.name}</strong>
                      <div className="vm-id">ID: {server.id.slice(-8)}</div>
                    </td>
                    <td>
                      {server.userName || server.userEmail}
                      <div className="vm-id">{server.userId?.slice(-8)}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${server.status}`}>
                        {server.status === 'running' ? 'Работает' : 'Остановлен'}
                      </span>
                    </td>
                    <td>
                      <code>{server.ip || '—'}</code>
                    </td>
                    <td>
                      <div className="vm-specs">
                        {server.cpu} vCPU / {server.ram} GB
                        <div>{server.disk} GB SSD</div>
                      </div>
                    </td>
                    <td>
                      <i className={server.osIcon || 'fab fa-linux'}></i> {server.os || 'Linux'}
                    </td>
                    <td>
                      <div className="traffic-info">
                        <div>Исп.: {server.traffic?.used || 0} GB</div>
                        <div>Лимит: {server.traffic?.limit || 0} GB</div>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {server.status === 'stopped' ? (
                          <button 
                            className="icon-btn success" 
                            onClick={() => handleStartVM(server)}
                            title="Запустить"
                          >
                            <i className="fas fa-play"></i>
                          </button>
                        ) : (
                          <button 
                            className="icon-btn warning" 
                            onClick={() => handleStopVM(server)}
                            title="Остановить"
                          >
                            <i className="fas fa-stop"></i>
                          </button>
                        )}
                        <button 
                          className="icon-btn" 
                          onClick={() => handleAllocateTraffic(server)}
                          title="Выделить трафик"
                        >
                          <i className="fas fa-chart-line"></i>
                        </button>
                        <button 
                          className="icon-btn" 
                          onClick={() => handleEditVM(server)}
                          title="Редактировать"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="icon-btn danger" 
                          onClick={() => handleDeleteVM(server)}
                          title="Удалить"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fas fa-server" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
              <p>Нет созданных серверов</p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'userDetails' && selectedUserDetails && (
        <div className="user-details">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button className="action-btn" onClick={handleBackToUsers}>
              <i className="fas fa-arrow-left"></i> Назад к списку
            </button>
            <div>
              <button 
                className="action-btn primary" 
                onClick={() => handleCreateVMForUser(selectedUserDetails.user)}
                style={{ marginRight: '10px' }}
              >
                <i className="fas fa-plus"></i> Создать сервер
              </button>
              <button 
                className="action-btn" 
                onClick={() => handleAddFunds(selectedUserDetails.user)}
              >
                <i className="fas fa-coins"></i> Пополнить баланс
              </button>
            </div>
          </div>

          {/* Информация о пользователе */}
          <div className="widget-grid" style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="card-title">
                <i className="fas fa-user"></i> Основная информация
              </div>
              <div className="service-row">
                <span>Имя:</span>
                <span><strong>{selectedUserDetails.user?.fullName || 'Не указано'}</strong></span>
              </div>
              <div className="service-row">
                <span>Email:</span>
                <span>{selectedUserDetails.user?.email}</span>
              </div>
              <div className="service-row">
                <span>Компания:</span>
                <span>{selectedUserDetails.user?.company || '-'}</span>
              </div>
              <div className="service-row">
                <span>Телефон:</span>
                <span>{selectedUserDetails.user?.phone || '-'}</span>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <i className="fas fa-chart-pie"></i> Статистика
              </div>
              <div className="service-row">
                <span>Баланс:</span>
                <span className="mts-red">{selectedUserDetails.data?.balance || 0} ₽</span>
              </div>
              <div className="service-row">
                <span>Серверов:</span>
                <span>{userServers.length}</span>
              </div>
              <div className="service-row">
                <span>Всего vCPU:</span>
                <span>{userServers.reduce((acc, s) => acc + (s.cpu || 0), 0)}</span>
              </div>
              <div className="service-row">
                <span>Всего RAM:</span>
                <span>{userServers.reduce((acc, s) => acc + (s.ram || 0), 0)} GB</span>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <i className="fas fa-calendar"></i> Даты
              </div>
              <div className="service-row">
                <span>Регистрация:</span>
                <span>{new Date(selectedUserDetails.user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="service-row">
                <span>Последний вход:</span>
                <span>
                  {selectedUserDetails.user?.lastLogin 
                    ? new Date(selectedUserDetails.user.lastLogin).toLocaleString() 
                    : 'Никогда'}
                </span>
              </div>
            </div>
          </div>

          {/* Серверы пользователя */}
          <div className="resources-section">
            <h3>Серверы пользователя ({userServers.length})</h3>
            {userServers.length > 0 ? (
              <table className="resource-table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Статус</th>
                    <th>IP</th>
                    <th>Конфигурация</th>
                    <th>ОС</th>
                    <th>Трафик</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {userServers.map(server => (
                    <tr key={server.id}>
                      <td>
                        <strong>{server.name}</strong>
                      </td>
                      <td>
                        <span className={`status-badge ${server.status}`}>
                          {server.status === 'running' ? 'Работает' : 'Остановлен'}
                        </span>
                      </td>
                      <td>
                        <code>{server.ip || '—'}</code>
                      </td>
                      <td>
                        {server.cpu} vCPU / {server.ram} GB
                        <div>{server.disk} GB</div>
                      </td>
                      <td>
                        <i className={server.osIcon}></i> {server.os}
                      </td>
                      <td>
                        <div>Исп.: {server.traffic?.used || 0} GB</div>
                        <div>Лимит: {server.traffic?.limit || 0} GB</div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {server.status === 'stopped' ? (
                            <button className="icon-btn success" onClick={() => handleStartVM(server)}>
                              <i className="fas fa-play"></i>
                            </button>
                          ) : (
                            <button className="icon-btn warning" onClick={() => handleStopVM(server)}>
                              <i className="fas fa-stop"></i>
                            </button>
                          )}
                          <button className="icon-btn" onClick={() => handleAllocateTraffic(server)}>
                            <i className="fas fa-chart-line"></i>
                          </button>
                          <button className="icon-btn" onClick={() => handleEditVM(server)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="icon-btn danger" onClick={() => handleDeleteVM(server)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>У пользователя нет серверов</p>
                <button 
                  className="action-btn primary" 
                  onClick={() => handleCreateVMForUser(selectedUserDetails.user)}
                >
                  <i className="fas fa-plus"></i> Создать первый сервер
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;