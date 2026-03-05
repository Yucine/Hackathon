import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const ManagementAudit = () => {
  const { hasResources, getResources } = useApp();
  const { currentUser } = useAuth();
  const vms = getResources('vms');
  const volumes = getResources('volumes');

  // Генерируем тестовые события аудита на основе реальных ресурсов
  const auditEvents = [];

  if (hasResources) {
    // Добавляем события создания ресурсов
    vms.forEach(vm => {
      auditEvents.push({
        time: vm.created || new Date().toLocaleString(),
        user: currentUser?.email || 'user@example.com',
        action: 'Создание ВМ',
        resource: vm.name,
        ip: '192.168.1.45',
        result: 'success'
      });
    });

    volumes.forEach(vol => {
      auditEvents.push({
        time: vol.created || new Date().toLocaleString(),
        user: currentUser?.email || 'user@example.com',
        action: 'Создание диска',
        resource: vol.name,
        ip: '192.168.1.45',
        result: 'success'
      });
    });
  }

  if (!hasResources || auditEvents.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-history"></i>
        </div>
        <h1>Журнал аудита пуст</h1>
        <p>Здесь будут отображаться все действия с ресурсами</p>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary"><i className="fas fa-download"></i> Экспорт логов</div>
        <div className="action-btn"><i className="fas fa-filter"></i> Фильтр</div>
      </div>

      <div className="resources-section">
        <h3>Журнал аудита</h3>
        <table className="resource-table">
          <thead>
            <tr>
              <th>Время</th>
              <th>Пользователь</th>
              <th>Действие</th>
              <th>Ресурс</th>
              <th>IP-адрес</th>
              <th>Результат</th>
            </tr>
          </thead>
          <tbody>
            {auditEvents.map((event, idx) => (
              <tr key={idx}>
                <td>{event.time}</td>
                <td>{event.user}</td>
                <td>{event.action}</td>
                <td>{event.resource}</td>
                <td>{event.ip}</td>
                <td>
                  <span className="status-badge running">
                    Успешно
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ManagementAudit;