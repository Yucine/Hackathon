import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

// Простая версия без графиков для устранения ошибок
const ManagementMonitoring = () => {
  const { getResources, hasResources, isAdmin, getAllServers } = useApp();
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedServer, setSelectedServer] = useState('all');
  
  // Получаем данные
  const userVMs = getResources('vms');
  const allServers = isAdmin ? getAllServers() : [];
  const vms = isAdmin ? allServers : userVMs;

  const [currentMetrics, setCurrentMetrics] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    network: 0
  });

  // Обновление данных при изменении выбранного сервера
  useEffect(() => {
    const targetVMs = selectedServer === 'all' 
      ? vms 
      : vms.filter(v => v.id === selectedServer);

    if (targetVMs.length === 0) {
      setCurrentMetrics({
        cpu: 0,
        ram: 0,
        disk: 0,
        network: 0
      });
      return;
    }

    // Рассчитываем средние значения
    const avgCPU = targetVMs.reduce((sum, vm) => 
      sum + (vm.status === 'running' ? (vm.specs?.cpu?.used || 15 + Math.random() * 20) : 0), 0
    ) / Math.max(targetVMs.length, 1);

    const avgRAM = targetVMs.reduce((sum, vm) => 
      sum + (vm.status === 'running' ? (vm.specs?.ram?.used || 25 + Math.random() * 30) : 0), 0
    ) / Math.max(targetVMs.length, 1);

    const avgDisk = targetVMs.reduce((sum, vm) => 
      sum + (vm.specs?.disk?.used || 20 + Math.random() * 15), 0
    ) / Math.max(targetVMs.length, 1);

    const avgNetwork = targetVMs.reduce((sum, vm) => 
      sum + (vm.status === 'running' ? (vm.network?.bandwidth || 30 + Math.random() * 40) : 0), 0
    ) / Math.max(targetVMs.length, 1);

    setCurrentMetrics({
      cpu: Math.round(avgCPU * 10) / 10,
      ram: Math.round(avgRAM * 10) / 10,
      disk: Math.round(avgDisk * 10) / 10,
      network: Math.round(avgNetwork * 10) / 10
    });

  }, [vms, selectedServer]);

  // Автообновление
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const targetVMs = selectedServer === 'all' 
        ? vms 
        : vms.filter(v => v.id === selectedServer);

      if (targetVMs.length === 0) return;

      const avgCPU = targetVMs.reduce((sum, vm) => 
        sum + (vm.status === 'running' ? (vm.specs?.cpu?.used || 15 + Math.random() * 20) : 0), 0
      ) / Math.max(targetVMs.length, 1);

      const avgRAM = targetVMs.reduce((sum, vm) => 
        sum + (vm.status === 'running' ? (vm.specs?.ram?.used || 25 + Math.random() * 30) : 0), 0
      ) / Math.max(targetVMs.length, 1);

      setCurrentMetrics(prev => ({
        ...prev,
        cpu: Math.round(avgCPU * 10) / 10,
        ram: Math.round(avgRAM * 10) / 10
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [vms, selectedServer, autoRefresh]);

  if (!hasResources && !isAdmin) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-chart-line"></i>
        </div>
        <h1>Нет данных для мониторинга</h1>
        <p>Создайте сервер для просмотра метрик</p>
        <button className="action-btn primary" onClick={() => {}}>
          <i className="fas fa-plus"></i> Создать сервер
        </button>
      </div>
    );
  }

  return (
    <div className="monitoring-dashboard">
      {/* Панель управления */}
      <div className="quick-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            className="action-btn"
            style={{ minWidth: '200px' }}
          >
            <option value="all">Все серверы</option>
            {vms.map(vm => (
              <option key={vm.id} value={vm.id}>
                {vm.name} ({vm.status === 'running' ? 'Работает' : 'Остановлен'})
              </option>
            ))}
          </select>

          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="action-btn"
          >
            <option value="1h">Последний час</option>
            <option value="6h">6 часов</option>
            <option value="24h">24 часа</option>
            <option value="7d">7 дней</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <label className="action-btn" style={{ cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Автообновление (5с)
          </label>
        </div>
      </div>

      {/* Текущие метрики */}
      <div className="widget-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-title">
            <i className="fas fa-microchip" style={{ color: '#e30613' }}></i> CPU
          </div>
          <div className="balance-large" style={{ fontSize: '36px' }}>
            {currentMetrics.cpu}%
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginTop: '8px' }}>
            <div className="progress-fill" style={{ 
              width: `${currentMetrics.cpu}%`, 
              background: '#e30613' 
            }}></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-memory" style={{ color: '#3498db' }}></i> RAM
          </div>
          <div className="balance-large" style={{ fontSize: '36px' }}>
            {currentMetrics.ram}%
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginTop: '8px' }}>
            <div className="progress-fill" style={{ 
              width: `${currentMetrics.ram}%`, 
              background: '#3498db' 
            }}></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-hdd" style={{ color: '#f39c12' }}></i> Диск
          </div>
          <div className="balance-large" style={{ fontSize: '36px' }}>
            {currentMetrics.disk}%
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginTop: '8px' }}>
            <div className="progress-fill" style={{ 
              width: `${currentMetrics.disk}%`, 
              background: '#f39c12' 
            }}></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-network-wired" style={{ color: '#2ecc71' }}></i> Сеть
          </div>
          <div className="balance-large" style={{ fontSize: '36px' }}>
            {currentMetrics.network} Мбит/с
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginTop: '8px' }}>
            <div className="progress-fill" style={{ 
              width: `${currentMetrics.network}%`, 
              background: '#2ecc71' 
            }}></div>
          </div>
        </div>
      </div>

      {/* Таблица серверов */}
      <div className="resources-section" style={{ marginTop: '24px' }}>
        <div className="resources-header">
          <h3>Детальная информация по серверам</h3>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th>Сервер</th>
              <th>Статус</th>
              <th>CPU</th>
              <th>RAM</th>
              <th>Диск</th>
              <th>Сеть</th>
            </tr>
          </thead>
          <tbody>
            {vms.map(vm => (
              <tr key={vm.id}>
                <td>
                  <strong>{vm.name}</strong>
                  {isAdmin && <div style={{ fontSize: '11px', color: 'var(--mts-gray)' }}>{vm.userEmail}</div>}
                </td>
                <td>
                  <span className={`status-badge ${vm.status}`}>
                    {vm.status === 'running' ? 'Работает' : 'Остановлен'}
                  </span>
                </td>
                <td>
                  <div style={{ width: '100px' }}>
                    <div className="progress-bar-bg">
                      <div className="progress-fill" style={{ 
                        width: `${vm.status === 'running' ? (vm.specs?.cpu?.used || 15) : 0}%`,
                        background: '#e30613'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '11px' }}>
                      {vm.status === 'running' ? (vm.specs?.cpu?.used || 15) : 0}%
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ width: '100px' }}>
                    <div className="progress-bar-bg">
                      <div className="progress-fill" style={{ 
                        width: `${vm.status === 'running' ? (vm.specs?.ram?.used || 25) : 0}%`,
                        background: '#3498db'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '11px' }}>
                      {vm.status === 'running' ? (vm.specs?.ram?.used || 2) : 0}/{vm.ram} GB
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ width: '100px' }}>
                    <div className="progress-bar-bg">
                      <div className="progress-fill" style={{ 
                        width: `${(vm.specs?.disk?.used || 20)}%`,
                        background: '#f39c12'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '11px' }}>
                      {(vm.specs?.disk?.used || 10)}/{vm.disk} GB
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '12px' }}>
                    {vm.status === 'running' ? (vm.network?.bandwidth || 30) : 0} Мбит/с
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagementMonitoring;