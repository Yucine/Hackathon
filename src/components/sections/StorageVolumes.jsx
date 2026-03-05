import React from 'react';
import { useApp } from '../../context/AppContext';

const StorageVolumes = () => {
  const { getResources, createResource, hasResources, showToast } = useApp();
  const volumes = getResources('volumes');
  const vms = getResources('vms');

  const totalSize = volumes.reduce((acc, v) => acc + (v.size || 0), 0);

  const handleCreateVolume = () => {
    const newVolume = createResource('volumes', {
      name: `volume-${Date.now()}`,
      size: 50,
      type: 'SSD',
      attachedTo: '',
      status: 'available',
      created: new Date().toLocaleDateString()
    });

    if (newVolume) {
      showToast('Диск создан', 'success');
    }
  };

  if (!hasResources || volumes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-database"></i>
        </div>
        <h1>У вас пока нет дисков</h1>
        <p>Создайте диск для хранения данных</p>
        <div className="empty-state-actions">
          <button className="action-btn primary" onClick={handleCreateVolume}>
            <i className="fas fa-plus"></i> Создать диск
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={handleCreateVolume}>
          <i className="fas fa-plus"></i> Создать диск
        </div>
        <div className="action-btn" onClick={() => showToast('Расширение диска', 'info')}>
          <i className="fas fa-expand"></i> Расширить
        </div>
      </div>

      <div className="widget-grid">
        <div className="card">
          <div className="card-title">Использование дисков</div>
          <div className="balance-large">{totalSize} GB</div>
          <div className="service-row">Всего дисков: <span>{volumes.length}</span></div>
          <div className="progress-bar-bg">
            <div className="progress-fill" style={{ width: `${(totalSize / 2000) * 100}%` }}></div>
          </div>
          <div className="service-row" style={{ marginTop: '10px' }}>
            Использовано {Math.round((totalSize / 2000) * 100)}% от 2 TB
          </div>
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>Мои диски ({volumes.length})</h3>
          <span className="view-all filter-btn" onClick={handleCreateVolume}>
            <i className="fas fa-plus"></i> Создать диск
          </span>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Имя</th>
              <th>Размер</th>
              <th>Тип</th>
              <th>Прикреплен к</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {volumes.map(volume => (
              <tr key={volume.id}>
                <td><input type="checkbox" /></td>
                <td>{volume.name}</td>
                <td>{volume.size} GB</td>
                <td>{volume.type}</td>
                <td>{volume.attachedTo || '-'}</td>
                <td>
                  <span className={`status-badge ${volume.status === 'available' ? 'running' : 'stopped'}`}>
                    {volume.status === 'available' ? 'Доступен' : 'Используется'}
                  </span>
                </td>
                <td><i className="fas fa-ellipsis-v action-icon"></i></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StorageVolumes;