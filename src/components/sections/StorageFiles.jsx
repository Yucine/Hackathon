import React from 'react';
import { useApp } from '../../context/AppContext';

const StorageFiles = () => {
  const { getResources, createResource, hasResources, showToast } = useApp();
  const files = getResources('files');

  const handleCreateFileStorage = () => {
    const newFileStorage = createResource('files', {
      name: `storage-${Date.now()}`,
      type: 'NFS',
      size: 100,
      protocol: 'NFS/SMB',
      mountPoint: `/mnt/storage-${Date.now()}`,
      status: 'active',
      created: new Date().toLocaleDateString()
    });

    if (newFileStorage) {
      showToast('Файловое хранилище создано', 'success');
    }
  };

  if (!hasResources || files.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-folder-open"></i>
        </div>
        <h1>У вас пока нет файловых хранилищ</h1>
        <p>Создайте файловое хранилище для общего доступа к данным</p>
        <div className="empty-state-actions">
          <button className="action-btn primary" onClick={handleCreateFileStorage}>
            <i className="fas fa-plus"></i> Создать хранилище
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={handleCreateFileStorage}>
          <i className="fas fa-folder-plus"></i> Создать хранилище
        </div>
        <div className="action-btn" onClick={() => showToast('Настройка общего доступа', 'info')}>
          <i className="fas fa-share-alt"></i> Общий доступ
        </div>
      </div>

      <div className="widget-grid">
        <div className="card">
          <div className="card-title">Использование хранилищ</div>
          <div className="balance-large">{files.reduce((acc, f) => acc + (f.size || 0), 0)} GB</div>
          <div className="service-row">Всего хранилищ: <span>{files.length}</span></div>
          <div className="progress-bar-bg">
            <div className="progress-fill" style={{ width: `${(files.reduce((acc, f) => acc + (f.size || 0), 0) / 1000) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>Файловые хранилища ({files.length})</h3>
          <span className="view-all filter-btn" onClick={handleCreateFileStorage}>
            <i className="fas fa-plus"></i> Создать
          </span>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Тип</th>
              <th>Размер</th>
              <th>Протокол</th>
              <th>Точка монтирования</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td>{file.name}</td>
                <td>{file.type || 'Общее'}</td>
                <td>{file.size} GB</td>
                <td>{file.protocol}</td>
                <td><code>{file.mountPoint}</code></td>
                <td>
                  <span className={`status-badge ${file.status === 'active' ? 'running' : 'stopped'}`}>
                    {file.status === 'active' ? 'Активно' : 'Неактивно'}
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

export default StorageFiles;