import React from 'react';
import { useApp } from '../../context/AppContext';

const NetworkIP = () => {
  const { getResources, createResource, hasResources, showToast } = useApp();
  const ips = getResources('ips');

  const handleOrderIP = () => {
    const newIP = createResource('ips', {
      ip: '45.67.89.' + Math.floor(Math.random() * 255),
      region: 'Москва',
      attachedTo: '',
      type: 'IPv4',
      status: 'available',
      created: new Date().toLocaleDateString()
    });

    if (newIP) {
      showToast('IP-адрес заказан', 'success');
    }
  };

  const handleAttachIP = (ipId) => {
    showToast('Функция привязки IP будет доступна позже', 'info');
  };

  if (!hasResources || ips.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-globe"></i>
        </div>
        <h1>У вас пока нет IP-адресов</h1>
        <p>Закажите плавающий IP для доступа к ресурсам</p>
        <div className="empty-state-actions">
          <button className="action-btn primary" onClick={handleOrderIP}>
            <i className="fas fa-globe"></i> Заказать IP
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={handleOrderIP}>
          <i className="fas fa-globe"></i> Заказать IP
        </div>
        <div className="action-btn" onClick={() => handleAttachIP()}>
          <i className="fas fa-link"></i> Привязать
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>Плавающие IP-адреса ({ips.length})</h3>
          <span className="view-all filter-btn" onClick={handleOrderIP}>
            <i className="fas fa-plus"></i> Заказать IP
          </span>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th>IP-адрес</th>
              <th>Регион</th>
              <th>Привязан к</th>
              <th>Тип</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {ips.map(ip => (
              <tr key={ip.id}>
                <td><code>{ip.ip}</code></td>
                <td>{ip.region}</td>
                <td>{ip.attachedTo || '-'}</td>
                <td>{ip.type}</td>
                <td>
                  <span className={`status-badge ${ip.status === 'available' ? 'stopped' : 'running'}`}>
                    {ip.status === 'available' ? 'Свободен' : 'Используется'}
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

export default NetworkIP;