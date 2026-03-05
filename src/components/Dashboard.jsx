import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    balance, 
    hasResources, 
    createVM,
    getResources,
    openModal,
    isAdmin,
    showToast
  } = useApp();

  // Получаем ресурсы пользователя
  const vms = getResources('vms');

  const handleCreateFirstVM = () => {
    console.log('Создание первого сервера...');
    const newVM = createVM({
      name: 'Мой первый сервер',
      type: 's2.small',
      cpu: 2,
      ram: 4,
      disk: 50,
      os: 'Ubuntu 22.04 LTS',
      osIcon: 'fab fa-ubuntu'
    });

    if (newVM) {
      showToast('✅ Сервер успешно создан!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showToast('❌ Ошибка при создании сервера', 'error');
    }
  };

  // Для админа показываем панель управления сразу
  if (isAdmin) {
    return (
      <div className="admin-dashboard">
        <div className="widget-grid" style={{ marginBottom: '24px' }}>
          <div className="card stat-card" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
            <div className="card-title">
              <i className="fas fa-users-cog"></i> Управление пользователями
            </div>
            <div className="balance-large" style={{ fontSize: '28px' }}>
              {useAuth().getAllUsers().length}
            </div>
            <p style={{ color: 'var(--mts-gray)', marginTop: '8px' }}>
              активных пользователей
            </p>
            <div className="stat-footer">
              <span className="view-all">Перейти к управлению →</span>
            </div>
          </div>
          
          <div className="card stat-card" onClick={() => navigate('/section/compute-vm')} style={{ cursor: 'pointer' }}>
            <div className="card-title">
              <i className="fas fa-server"></i> Все серверы
            </div>
            <div className="balance-large" style={{ fontSize: '28px' }}>
              {useApp().getAllServers().length}
            </div>
            <p style={{ color: 'var(--mts-gray)', marginTop: '8px' }}>
              серверов в системе
            </p>
            <div className="stat-footer">
              <span className="view-all">Управление серверами →</span>
            </div>
          </div>

          <div className="card stat-card" onClick={() => navigate('/section/management-monitoring')} style={{ cursor: 'pointer' }}>
            <div className="card-title">
              <i className="fas fa-chart-line"></i> Системные метрики
            </div>
            <div className="balance-large" style={{ fontSize: '28px' }}>
              98%
            </div>
            <p style={{ color: 'var(--mts-gray)', marginTop: '8px' }}>
              стабильность системы
            </p>
            <div className="stat-footer">
              <span className="view-all">Мониторинг →</span>
            </div>
          </div>
        </div>
        
        <div className="quick-actions" style={{ justifyContent: 'center' }}>
          <button className="action-btn primary" onClick={() => openModal('createVM')}>
            <i className="fas fa-plus-circle"></i> Создать сервер для пользователя
          </button>
          <button className="action-btn" onClick={() => window.location.reload()}>
            <i className="fas fa-sync-alt"></i> Обновить данные
          </button>
        </div>
      </div>
    );
  }

  // Если нет ресурсов, показываем приветственный экран
  if (!hasResources) {
    return (
      <div className="welcome-container">
        <div className="welcome-card">
          <div className="welcome-icon">
            <i className="fas fa-cloud"></i>
          </div>
          
          <p className="welcome-text">
            У вас пока нет созданных ресурсов. Начните с создания первой виртуальной машины.
          </p>

          <div className="welcome-actions">
            <button
              onClick={handleCreateFirstVM}
              className="action-btn primary"
            >
              <i className="fas fa-plus"></i>
              Создать первый сервер
            </button>
          </div>

          {balance !== undefined && (
            <div className="welcome-balance">
              <i className="fas fa-info-circle"></i>
              Баланс для тестирования: {balance} ₽
            </div>
          )}
        </div>
      </div>
    );
  }

  // Если есть ресурсы, показываем обычный дашборд
  return (
    <>
      <div className="quick-actions">
        <button className="action-btn primary" onClick={() => openModal('createVM')}>
          <i className="fas fa-plus"></i> Создать сервер
        </button>
        <button className="action-btn" onClick={() => navigate('/section/compute-vm')}>
          <i className="fas fa-server"></i> Управление серверами
        </button>
        <button className="action-btn" onClick={() => navigate('/section/management-monitoring')}>
          <i className="fas fa-chart-line"></i> Мониторинг
        </button>
      </div>

      <div className="widget-grid">
        <div className="card">
          <div className="card-title">
            <span className="status-indicator"></span> Состояние платформы
          </div>
          <div className="service-row">
            <span>Все системы</span>
            <span className="status-badge running">● Работают</span>
          </div>
          <div className="service-row" style={{ marginTop: '16px' }}>
            <span>Активные серверы:</span>
            <span className="badge-count">{vms.filter(v => v.status === 'running').length}</span>
          </div>
          <div className="service-row">
            <span>Всего серверов:</span>
            <span className="badge-count">{vms.length}</span>
          </div>
        </div>

        <div className="card finance-widget">
          <div className="card-title"><i className="fas fa-chart-pie"></i> Финансы</div>
          <div className="balance-large">{balance} ₽</div>
          <div className="service-row">
            <span>Расходы сегодня</span>
            <span className="cost-value">{vms.length * 50} ₽</span>
          </div>
          <div className="service-row">
            <span>Прогноз на месяц</span>
            <span className="cost-value">{vms.length * 1500} ₽</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><i className="fas fa-history"></i> Последние события</div>
          <ul className="event-feed">
            {vms.slice(0, 3).map(vm => (
              <li key={vm.id} className="event-item">
                <span className="event-time">
                  {vm.createdAt ? new Date(vm.createdAt).toLocaleTimeString().slice(0,5) : 'только что'}
                </span>
                <span className="event-text">
                  <i className="fas fa-server" style={{ marginRight: '6px' }}></i>
                  Создан сервер "{vm.name}"
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>Мои серверы</h3>
          <span className="view-all" onClick={() => navigate('/section/compute-vm')}>
            Смотреть все <i className="fas fa-arrow-right"></i>
          </span>
        </div>

        {vms.length > 0 ? (
          <table className="resource-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Статус</th>
                <th>IP-адрес</th>
                <th>Конфигурация</th>
                <th>ОС</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {vms.slice(0, 5).map(vm => (
                <tr key={vm.id}>
                  <td>
                    <strong>{vm.name}</strong>
                  </td>
                  <td>
                    <span className={`status-badge ${vm.status}`}>
                      {vm.status === 'running' ? 'Работает' : 'Остановлен'}
                    </span>
                  </td>
                  <td>
                    <code>{vm.ip || '—'}</code>
                  </td>
                  <td>
                    {vm.cpu} vCPU / {vm.ram} GB
                  </td>
                  <td>
                    <i className={vm.osIcon || 'fab fa-linux'}></i> {vm.os}
                  </td>
                  <td>
                    <button 
                      className="icon-btn" 
                      onClick={() => navigate('/section/compute-vm')}
                      title="Управление"
                    >
                      <i className="fas fa-cog"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-table">
            <p>У вас пока нет серверов</p>
            <button className="action-btn primary" onClick={handleCreateFirstVM}>
              <i className="fas fa-plus"></i> Создать первый сервер
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;