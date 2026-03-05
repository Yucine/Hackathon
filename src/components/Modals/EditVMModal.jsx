import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const EditVMModal = () => {
  const { modals, closeModal, getVMById, updateUserData, showToast } = useApp();
  const { isAdmin, getUserData } = useAuth();
  const [vm, setVM] = useState(null);
  const [editMode, setEditMode] = useState('specs'); // specs, network, delete

  useEffect(() => {
    if (modals.editVM && modals.modalData) {
      const { vmId, userId } = modals.modalData;
      const vmData = getVMById(vmId, userId);
      setVM({ ...vmData, userId });
    }
  }, [modals.editVM, modals.modalData, getVMById]);

  if (!modals.editVM || !vm) return null;

  const handleUpdateSpecs = () => {
    const targetUserId = vm.userId;
    const targetData = getUserData(targetUserId);
    
    if (!targetData) return;

    const vms = targetData.resources.vms || [];
    const vmIndex = vms.findIndex(v => v.id === vm.id);
    
    if (vmIndex === -1) return;

    vms[vmIndex] = { ...vms[vmIndex], ...vm };
    
    updateUserData({
      resources: { ...targetData.resources, vms }
    }, targetUserId);

    showToast('Конфигурация обновлена', 'success');
    closeModal('editVM');
  };

  const handleAllocateTraffic = () => {
    const traffic = parseInt(prompt('Введите объем трафика (GB):', '100'));
    if (traffic && traffic > 0) {
      setVM({ ...vm, allocatedTraffic: traffic });
      showToast(`Выделено ${traffic} GB трафика`, 'success');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Удалить этот сервер?')) {
      const targetUserId = vm.userId;
      const targetData = getUserData(targetUserId);
      
      if (!targetData) return;

      const vms = targetData.resources.vms || [];
      const updatedVMs = vms.filter(v => v.id !== vm.id);
      
      updateUserData({
        resources: { ...targetData.resources, vms: updatedVMs }
      }, targetUserId);

      showToast('Сервер удален', 'success');
      closeModal('editVM');
    }
  };

  return (
    <div className="modal-overlay active" onClick={() => closeModal('editVM')}>
      <div className="modal-content edit-vm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Управление сервером: {vm.name}</h3>
          <i className="fas fa-times modal-close" onClick={() => closeModal('editVM')}></i>
        </div>

        <div className="modal-body">
          {/* Вкладки */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            borderBottom: '2px solid var(--mts-border)',
            marginBottom: '20px'
          }}>
            <button
              className={`tab-btn ${editMode === 'specs' ? 'active' : ''}`}
              onClick={() => setEditMode('specs')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                borderBottom: editMode === 'specs' ? '3px solid var(--mts-red)' : 'none',
                color: editMode === 'specs' ? 'var(--mts-red)' : 'var(--mts-gray)',
                cursor: 'pointer',
                fontWeight: editMode === 'specs' ? '600' : '400'
              }}
            >
              <i className="fas fa-microchip"></i> Характеристики
            </button>
            <button
              className={`tab-btn ${editMode === 'network' ? 'active' : ''}`}
              onClick={() => setEditMode('network')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                borderBottom: editMode === 'network' ? '3px solid var(--mts-red)' : 'none',
                color: editMode === 'network' ? 'var(--mts-red)' : 'var(--mts-gray)',
                cursor: 'pointer',
                fontWeight: editMode === 'network' ? '600' : '400'
              }}
            >
              <i className="fas fa-network-wired"></i> Сеть
            </button>
            {isAdmin && (
              <button
                className={`tab-btn ${editMode === 'delete' ? 'active' : ''}`}
                onClick={() => setEditMode('delete')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'none',
                  borderBottom: editMode === 'delete' ? '3px solid var(--mts-red)' : 'none',
                  color: editMode === 'delete' ? 'var(--mts-red)' : 'var(--mts-gray)',
                  cursor: 'pointer',
                  fontWeight: editMode === 'delete' ? '600' : '400'
                }}
              >
                <i className="fas fa-trash"></i> Управление
              </button>
            )}
          </div>

          {editMode === 'specs' && (
            <div>
              <h4 style={{ marginBottom: '16px' }}>Редактирование характеристик</h4>
              
              <div className="auth-form-group">
                <label>Имя сервера</label>
                <input
                  type="text"
                  value={vm.name}
                  onChange={(e) => setVM({...vm, name: e.target.value})}
                />
              </div>

              <div className="auth-form-group">
                <label>Процессор (vCPU)</label>
                <input
                  type="number"
                  value={vm.cpu}
                  onChange={(e) => setVM({
                    ...vm, 
                    cpu: parseInt(e.target.value),
                    specs: { ...vm.specs, cpu: { total: parseInt(e.target.value), used: 0 } }
                  })}
                  min="1"
                  max="32"
                />
              </div>

              <div className="auth-form-group">
                <label>Оперативная память (GB)</label>
                <input
                  type="number"
                  value={vm.ram}
                  onChange={(e) => setVM({
                    ...vm, 
                    ram: parseInt(e.target.value),
                    specs: { ...vm.specs, ram: { total: parseInt(e.target.value), used: 0 } }
                  })}
                  min="1"
                  max="128"
                />
              </div>

              <div className="auth-form-group">
                <label>Дисковое пространство (GB)</label>
                <input
                  type="number"
                  value={vm.disk}
                  onChange={(e) => setVM({
                    ...vm, 
                    disk: parseInt(e.target.value),
                    specs: { ...vm.specs, disk: { total: parseInt(e.target.value), used: 0 } }
                  })}
                  min="10"
                  max="2000"
                />
              </div>

              <div className="auth-form-group">
                <label>Операционная система</label>
                <select 
                  value={vm.os}
                  onChange={(e) => setVM({...vm, os: e.target.value})}
                >
                  <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS</option>
                  <option value="CentOS 9 Stream">CentOS 9 Stream</option>
                  <option value="Debian 12">Debian 12</option>
                  <option value="Windows Server 2022">Windows Server 2022</option>
                  <option value="Astra Linux">Astra Linux</option>
                </select>
              </div>
            </div>
          )}

          {editMode === 'network' && (
            <div>
              <h4 style={{ marginBottom: '16px' }}>Сетевые настройки</h4>
              
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="service-row">
                  <span>Текущий IP:</span>
                  <code>{vm.ip || 'Не назначен'}</code>
                </div>
                <div className="service-row">
                  <span>Статус:</span>
                  <span className={`status-badge ${vm.status}`}>
                    {vm.status === 'running' ? 'Работает' : 'Остановлен'}
                  </span>
                </div>
                {vm.allocatedTraffic && (
                  <div className="service-row">
                    <span>Выделенный трафик:</span>
                    <span>{vm.allocatedTraffic} GB</span>
                  </div>
                )}
              </div>

              <button 
                className="action-btn" 
                onClick={handleAllocateTraffic}
                style={{ width: '100%', marginBottom: '8px' }}
              >
                <i className="fas fa-chart-line"></i>
                Выделить трафик
              </button>

              {!vm.ip && (
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    const newIP = `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                    setVM({...vm, ip: newIP});
                    showToast(`Назначен IP: ${newIP}`, 'success');
                  }}
                  style={{ width: '100%' }}
                >
                  <i className="fas fa-globe"></i>
                  Назначить IP
                </button>
              )}
            </div>
          )}

          {editMode === 'delete' && isAdmin && (
            <div>
              <h4 style={{ marginBottom: '16px', color: 'var(--mts-red)' }}>
                <i className="fas fa-exclamation-triangle"></i> Опасная зона
              </h4>
              
              <p style={{ marginBottom: '20px' }}>
                Удаление сервера приведет к потере всех данных. Это действие нельзя отменить.
              </p>

              <button 
                className="modal-btn cancel"
                onClick={handleDelete}
                style={{ 
                  width: '100%',
                  background: '#fee2e2',
                  color: '#dc2626',
                  borderColor: '#fecaca'
                }}
              >
                <i className="fas fa-trash"></i>
                Удалить сервер
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="modal-btn cancel" 
            onClick={() => closeModal('editVM')}
          >
            Закрыть
          </button>
          {editMode === 'specs' && (
            <button 
              className="modal-btn primary" 
              onClick={handleUpdateSpecs}
            >
              Сохранить изменения
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditVMModal;