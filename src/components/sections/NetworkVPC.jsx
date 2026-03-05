import React from 'react';
import { useApp } from '../../context/AppContext';

const NetworkVPC = () => {
  const { getResources, createResource, hasResources, showToast } = useApp();
  const networks = getResources('networks');

  const handleCreateVPC = () => {
    const newNetwork = createResource('networks', {
      name: `vpc-${Date.now()}`,
      cidr: '10.0.0.0/16',
      region: 'Москва',
      subnets: 2,
      status: 'active',
      created: new Date().toLocaleDateString()
    });

    if (newNetwork) {
      showToast('Виртуальная сеть создана', 'success');
    }
  };

  if (!hasResources || networks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-network-wired"></i>
        </div>
        <h1>У вас пока нет виртуальных сетей</h1>
        <p>Создайте VPC для изоляции ваших ресурсов</p>
        <div className="empty-state-actions">
          <button className="action-btn primary" onClick={handleCreateVPC}>
            <i className="fas fa-plus"></i> Создать VPC
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={handleCreateVPC}>
          <i className="fas fa-plus"></i> Создать VPC
        </div>
        <div className="action-btn" onClick={() => showToast('Управление подсетями', 'info')}>
          <i className="fas fa-network-wired"></i> Подсети
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>Виртуальные сети ({networks.length})</h3>
          <span className="view-all filter-btn" onClick={handleCreateVPC}>
            <i className="fas fa-plus"></i> Создать VPC
          </span>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>CIDR</th>
              <th>Регион</th>
              <th>Подсети</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {networks.map(network => (
              <tr key={network.id}>
                <td>{network.name}</td>
                <td><code>{network.cidr}</code></td>
                <td>{network.region}</td>
                <td>{network.subnets}</td>
                <td>
                  <span className="status-badge running">
                    Активно
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

export default NetworkVPC;