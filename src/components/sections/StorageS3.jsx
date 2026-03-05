import React from 'react';
import { useApp } from '../../context/AppContext';

const StorageS3 = () => {
  const { getResources, createResource, hasResources, showToast } = useApp();
  const buckets = getResources('buckets');

  const handleCreateBucket = () => {
    const newBucket = createResource('buckets', {
      name: `bucket-${Date.now()}`,
      region: 'Москва',
      objects: 0,
      size: 0,
      created: new Date().toLocaleDateString(),
      status: 'active'
    });

    if (newBucket) {
      showToast('Бакет создан', 'success');
    }
  };

  if (!hasResources || buckets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-cloud-upload-alt"></i>
        </div>
        <h1>У вас пока нет бакетов</h1>
        <p>Создайте S3 бакет для хранения объектов</p>
        <div className="empty-state-actions">
          <button className="action-btn primary" onClick={handleCreateBucket}>
            <i className="fas fa-plus-circle"></i> Создать бакет
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={handleCreateBucket}>
          <i className="fas fa-plus-circle"></i> Создать бакет
        </div>
        <div className="action-btn" onClick={() => showToast('Загрузка файлов', 'info')}>
          <i className="fas fa-upload"></i> Загрузить файлы
        </div>
      </div>

      <div className="widget-grid">
        <div className="card">
          <div className="card-title">S3 Хранилище</div>
          <div className="balance-large">{buckets.reduce((acc, b) => acc + (b.size || 0), 0)} GB</div>
          <div className="service-row">Использовано <span>{buckets.reduce((acc, b) => acc + (b.size || 0), 0)} GB / 1 TB</span></div>
          <div className="progress-bar-bg">
            <div className="progress-fill" style={{ width: `${(buckets.reduce((acc, b) => acc + (b.size || 0), 0) / 1000) * 100}%` }}></div>
          </div>
          <div className="service-row" style={{ marginTop: '10px' }}>
            Количество объектов: {buckets.reduce((acc, b) => acc + (b.objects || 0), 0)}
          </div>
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>Бакеты ({buckets.length})</h3>
          <span className="view-all filter-btn" onClick={handleCreateBucket}>
            <i className="fas fa-plus"></i> Создать бакет
          </span>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th>Имя бакета</th>
              <th>Регион</th>
              <th>Объектов</th>
              <th>Размер</th>
              <th>Дата создания</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map(bucket => (
              <tr key={bucket.id}>
                <td>{bucket.name}</td>
                <td>{bucket.region}</td>
                <td>{bucket.objects}</td>
                <td>{bucket.size} GB</td>
                <td>{bucket.created}</td>
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

export default StorageS3;