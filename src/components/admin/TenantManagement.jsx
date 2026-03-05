import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const TenantManagement = () => {
  const { getAllUsers, getUserData, saveUserData } = useAuth();
  const { showToast, showConfirmDialog } = useApp();
  
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showEditLimits, setShowEditLimits] = useState(false);
  const [limits, setLimits] = useState({
    maxCPU: 16,
    maxRAM: 64,
    maxDisk: 1000,
    maxVMs: 5,
    maxVolumes: 10,
    maxNetworks: 3,
    maxIPs: 5
  });

  const [usage, setUsage] = useState({
    totalCPU: 0,
    totalRAM: 0,
    totalDisk: 0,
    totalVMs: 0,
    totalVolumes: 0,
    totalNetworks: 0,
    totalIPs: 0
  });

  useEffect(() => {
    loadTenants();
    calculateGlobalUsage();
  }, []);

  const loadTenants = () => {
    const users = getAllUsers();
    const tenantsData = users.map(user => {
      const userData = getUserData(user.id);
      const vms = userData?.resources?.vms || [];
      const volumes = userData?.resources?.volumes || [];
      const networks = userData?.resources?.networks || [];
      const ips = vms.filter(vm => vm.ip).length;
      
      return {
        ...user,
        data: userData,
        limits: userData?.limits || {
          maxCPU: 16,
          maxRAM: 64,
          maxDisk: 1000,
          maxVMs: 5,
          maxVolumes: 10,
          maxNetworks: 3,
          maxIPs: 5
        },
        usage: {
          cpu: vms.reduce((acc, vm) => acc + (vm.cpu || 0), 0),
          ram: vms.reduce((acc, vm) => acc + (vm.ram || 0), 0),
          disk: vms.reduce((acc, vm) => acc + (vm.disk || 0), 0) + 
                volumes.reduce((acc, vol) => acc + (vol.size || 0), 0),
          vms: vms.length,
          volumes: volumes.length,
          networks: networks.length,
          ips: ips
        }
      };
    });
    setTenants(tenantsData);
  };

  const calculateGlobalUsage = () => {
    const users = getAllUsers();
    let total = {
      totalCPU: 0,
      totalRAM: 0,
      totalDisk: 0,
      totalVMs: 0,
      totalVolumes: 0,
      totalNetworks: 0,
      totalIPs: 0
    };

    users.forEach(user => {
      const userData = getUserData(user.id);
      const vms = userData?.resources?.vms || [];
      const volumes = userData?.resources?.volumes || [];
      const networks = userData?.resources?.networks || [];
      
      total.totalCPU += vms.reduce((acc, vm) => acc + (vm.cpu || 0), 0);
      total.totalRAM += vms.reduce((acc, vm) => acc + (vm.ram || 0), 0);
      total.totalDisk += vms.reduce((acc, vm) => acc + (vm.disk || 0), 0) + 
                        volumes.reduce((acc, vol) => acc + (vol.size || 0), 0);
      total.totalVMs += vms.length;
      total.totalVolumes += volumes.length;
      total.totalNetworks += networks.length;
      total.totalIPs += vms.filter(vm => vm.ip).length;
    });

    setUsage(total);
  };

  const handleEditLimits = (tenant) => {
    setSelectedTenant(tenant);
    setLimits(tenant.limits);
    setShowEditLimits(true);
  };

  const handleSaveLimits = () => {
    if (!selectedTenant) return;

    const userData = getUserData(selectedTenant.id);
    userData.limits = limits;
    saveUserData(userData, selectedTenant.id);

    showToast(`✅ Лимиты для ${selectedTenant.fullName} обновлены`, 'success');
    setShowEditLimits(false);
    loadTenants();
  };

  const handleResetLimits = (tenant) => {
    showConfirmDialog(
      'Сброс лимитов',
      `Сбросить лимиты для ${tenant.fullName} к значениям по умолчанию?`,
      'fa-rotate-left',
      () => {
        const userData = getUserData(tenant.id);
        userData.limits = {
          maxCPU: 16,
          maxRAM: 64,
          maxDisk: 1000,
          maxVMs: 5,
          maxVolumes: 10,
          maxNetworks: 3,
          maxIPs: 5
        };
        saveUserData(userData, tenant.id);
        showToast(`🔄 Лимиты для ${tenant.fullName} сброшены`, 'info');
        loadTenants();
      }
    );
  };

  return (
    <div className="tenant-management">
      <h1>
        <i className="fas fa-building" style={{ color: 'var(--mts-red)', marginRight: '12px' }}></i>
        Управление клиентами
      </h1>

      {/* Глобальная статистика */}
      <div className="widget-grid" style={{ marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="card-title">
            <i className="fas fa-microchip"></i> Всего CPU
          </div>
          <div className="balance-large">{usage.totalCPU}</div>
          <p style={{ color: 'var(--mts-gray)' }}>vCPU в использовании</p>
        </div>
        <div className="card stat-card">
          <div className="card-title">
            <i className="fas fa-memory"></i> Всего RAM
          </div>
          <div className="balance-large">{usage.totalRAM} GB</div>
          <p style={{ color: 'var(--mts-gray)' }}>памяти в использовании</p>
        </div>
        <div className="card stat-card">
          <div className="card-title">
            <i className="fas fa-hdd"></i> Всего дисков
          </div>
          <div className="balance-large">{usage.totalDisk} GB</div>
          <p style={{ color: 'var(--mts-gray)' }}>дискового пространства</p>
        </div>
        <div className="card stat-card">
          <div className="card-title">
            <i className="fas fa-server"></i> Всего серверов
          </div>
          <div className="balance-large">{usage.totalVMs}</div>
          <p style={{ color: 'var(--mts-gray)' }}>виртуальных машин</p>
        </div>
      </div>

      {/* Список клиентов */}
      <div className="resources-section">
        <div className="resources-header">
          <h3>Клиенты ({tenants.length})</h3>
          <span className="view-all" onClick={loadTenants}>
            <i className="fas fa-sync-alt"></i> Обновить
          </span>
        </div>

        <div className="table-responsive">
          <table className="resource-table">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Email</th>
                <th>Использование CPU</th>
                <th>Использование RAM</th>
                <th>Серверы</th>
                <th>Лимиты</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => {
                const usage = tenant.usage;
                const limits = tenant.limits;
                
                const cpuPercent = Math.min(100, Math.round((usage.cpu / limits.maxCPU) * 100));
                const ramPercent = Math.min(100, Math.round((usage.ram / limits.maxRAM) * 100));
                const vmPercent = Math.min(100, Math.round((usage.vms / limits.maxVMs) * 100));

                return (
                  <tr key={tenant.id}>
                    <td>
                      <strong>{tenant.fullName}</strong>
                      <div className="tenant-company">{tenant.company || '—'}</div>
                    </td>
                    <td>{tenant.email}</td>
                    <td>
                      <div className="usage-indicator">
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${cpuPercent}%`,
                              background: cpuPercent > 80 ? '#ef4444' : 
                                         cpuPercent > 60 ? '#f59e0b' : '#10b981'
                            }}
                          ></div>
                        </div>
                        <span className="usage-text">
                          {usage.cpu} / {limits.maxCPU} vCPU
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="usage-indicator">
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${ramPercent}%`,
                              background: ramPercent > 80 ? '#ef4444' : 
                                         ramPercent > 60 ? '#f59e0b' : '#10b981'
                            }}
                          ></div>
                        </div>
                        <span className="usage-text">
                          {usage.ram} / {limits.maxRAM} GB
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="usage-indicator">
                        <div className="progress-bar-bg">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${vmPercent}%`,
                              background: vmPercent > 80 ? '#ef4444' : 
                                         vmPercent > 60 ? '#f59e0b' : '#10b981'
                            }}
                          ></div>
                        </div>
                        <span className="usage-text">
                          {usage.vms} / {limits.maxVMs}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          className="icon-btn" 
                          onClick={() => handleEditLimits(tenant)}
                          title="Редактировать лимиты"
                        >
                          <i className="fas fa-sliders-h"></i>
                        </button>
                        <button 
                          className="icon-btn" 
                          onClick={() => handleResetLimits(tenant)}
                          title="Сбросить лимиты"
                        >
                          <i className="fas fa-rotate-left"></i>
                        </button>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="icon-btn" 
                        onClick={() => alert(`Просмотр деталей ${tenant.fullName}`)}
                        title="Просмотр деталей"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно редактирования лимитов */}
      {showEditLimits && (
        <div className="modal-overlay active" onClick={() => setShowEditLimits(false)}>
          <div className="modal-content limits-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-sliders-h" style={{ marginRight: '8px', color: 'var(--mts-red)' }}></i>
                Лимиты для {selectedTenant?.fullName}
              </h3>
              <i className="fas fa-times modal-close" onClick={() => setShowEditLimits(false)}></i>
            </div>
            <div className="modal-body">
              <div className="limits-grid">
                <div className="limit-item">
                  <label>Макс. CPU (vCPU)</label>
                  <input 
                    type="number" 
                    value={limits.maxCPU}
                    onChange={(e) => setLimits({...limits, maxCPU: parseInt(e.target.value)})}
                    min="1"
                    max="128"
                  />
                </div>
                <div className="limit-item">
                  <label>Макс. RAM (GB)</label>
                  <input 
                    type="number" 
                    value={limits.maxRAM}
                    onChange={(e) => setLimits({...limits, maxRAM: parseInt(e.target.value)})}
                    min="1"
                    max="512"
                  />
                </div>
                <div className="limit-item">
                  <label>Макс. Диск (GB)</label>
                  <input 
                    type="number" 
                    value={limits.maxDisk}
                    onChange={(e) => setLimits({...limits, maxDisk: parseInt(e.target.value)})}
                    min="10"
                    max="10000"
                  />
                </div>
                <div className="limit-item">
                  <label>Макс. Серверов</label>
                  <input 
                    type="number" 
                    value={limits.maxVMs}
                    onChange={(e) => setLimits({...limits, maxVMs: parseInt(e.target.value)})}
                    min="1"
                    max="50"
                  />
                </div>
                <div className="limit-item">
                  <label>Макс. Дисков</label>
                  <input 
                    type="number" 
                    value={limits.maxVolumes}
                    onChange={(e) => setLimits({...limits, maxVolumes: parseInt(e.target.value)})}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="limit-item">
                  <label>Макс. Сетей</label>
                  <input 
                    type="number" 
                    value={limits.maxNetworks}
                    onChange={(e) => setLimits({...limits, maxNetworks: parseInt(e.target.value)})}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="limit-item">
                  <label>Макс. IP-адресов</label>
                  <input 
                    type="number" 
                    value={limits.maxIPs}
                    onChange={(e) => setLimits({...limits, maxIPs: parseInt(e.target.value)})}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowEditLimits(false)}>
                Отмена
              </button>
              <button className="modal-btn primary" onClick={handleSaveLimits}>
                Сохранить лимиты
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;