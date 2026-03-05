import React from 'react';
import { useApp } from '../../context/AppContext';

const NetworkLB = () => {
  const { getResources, createResource, hasResources, showToast } = useApp();
  const loadBalancers = getResources('loadBalancers');

  const handleCreateLB = () => {
    const newLB = createResource('loadBalancers', {
      name: `lb-${Date.now()}`,
      type: 'HTTP/HTTPS',
      ip: '45.67.89.' + Math.floor(Math.random() * 255),
      ports: '80,443',
      targets: 'web-01, web-02',
      status: 'active',
      created: new Date().toLocaleDateString()
    });

    if (newLB) {
      showToast('Балансировщик создан', 'success');
    }
  };

  if (!hasResources || loadBalancers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-balance-scale"></i>
        </div>
        <h1>У вас пока нет балансировщиков</h1>
        <p>Создайте балансировщик для распределения нагрузки</p>
        <div className="empty-state-actions">
          <button className="action-btn primary" onClick={handleCreateLB}>
            <i className="fas fa-plus"></i> Создать балансировщик
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={handleCreateLB}>
          <i className="fas fa-plus"></i> Создать балансировщик
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>Балансировщики нагрузки ({loadBalancers.length})</h3>
          <span className="view-all filter-btn" onClick={handleCreateLB}>
            <i className="fas fa-plus"></i> Создать
          </span>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Тип</th>
              <th>IP-адрес</th>
              <th>Порты</th>
              <th>Цели</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {loadBalancers.map(lb => (
              <tr key={lb.id}>
                <td>{lb.name}</td>
                <td>{lb.type}</td>
                <td>{lb.ip}</td>
                <td>{lb.ports}</td>
                <td>{lb.targets}</td>
                <td>
                  <span className="status-badge running">
                    Активен
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

export default NetworkLB;