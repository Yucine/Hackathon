import React from 'react';
import { useApp } from '../../context/AppContext';

const ComputeBackups = () => {
  const { getResources, createResource, hasResources, showToast } = useApp();
  const backups = getResources('backups');
  const vms = getResources('vms');

  const handleCreateBackupRule = () => {
    if (vms.length === 0) {
      showToast('Сначала создайте виртуальную машину', 'warning');
      return;
    }

    const newBackup = createResource('backups', {
      name: `backup-${Date.now()}`,
      resource: vms[0]?.name || 'VM',
      schedule: 'Ежедневно 02:00',
      lastBackup: 'никогда',
      size: '0 GB',
      status: 'active'
    });

    if (newBackup) {
      showToast('Правило бэкапа создано', 'success');
    }
  };

  if (!hasResources || backups.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-camera-retro"></i>
        </div>
        <h1>Нет правил резервного копирования</h1>
        <p>Создайте правило бэкапа для защиты ваших данных</p>
        <div className="empty-state-actions">
          <button className="action-btn primary" onClick={handleCreateBackupRule}>
            <i className="fas fa-plus-circle"></i> Создать правило
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={handleCreateBackupRule}>
          <i className="fas fa-plus-circle"></i> Создать правило
        </div>
        <div className="action-btn" onClick={() => showToast('Восстановление из бэкапа', 'info')}>
          <i className="fas fa-history"></i> Восстановить
        </div>
        <div className="action-btn" onClick={() => showToast('Архив бэкапов', 'info')}>
          <i className="fas fa-archive"></i> Архив
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>Активные правила бэкапов ({backups.length})</h3>
          <span className="view-all filter-btn" onClick={handleCreateBackupRule}>
            <i className="fas fa-plus"></i> Добавить правило
          </span>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Ресурс</th>
              <th>Расписание</th>
              <th>Последний бэкап</th>
              <th>Размер</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {backups.map(backup => (
              <tr key={backup.id}>
                <td>{backup.name}</td>
                <td>{backup.resource}</td>
                <td>{backup.schedule}</td>
                <td>{backup.lastBackup}</td>
                <td>{backup.size}</td>
                <td><span className="status-badge running">Активно</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="widget-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-title"><i className="fas fa-database"></i> Хранилище бэкапов</div>
          <div className="balance-large">0 GB</div>
          <div className="service-row">Использовано <span>0 GB / 500 GB</span></div>
          <div className="progress-bar-bg"><div className="progress-fill" style={{ width: '0%' }}></div></div>
        </div>
      </div>
    </>
  );
};

export default ComputeBackups;