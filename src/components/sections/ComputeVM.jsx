import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const ComputeVM = () => {
  const { getResources, openModal, startVM, stopVM, deleteVM, showToast, showConfirmDialog, isAdmin } = useApp();
  const { getAllServers, getUserData } = useAuth();
  const [selectedVMs, setSelectedVMs] = useState([]);
  const [vms, setVms] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadVMs();
  }, [isAdmin, getResources, getAllServers]);

  const loadVMs = () => {
    if (isAdmin) {
      // Администратор видит все серверы
      const allServers = getAllServers();
      setVms(allServers);
    } else {
      // Пользователь видит только свои серверы
      const userVMs = getResources('vms');
      // Проверяем лимиты перед отображением
      const userData = getUserData();
      if (userData?.limits) {
        // Можно добавить логику проверки лимитов
      }
      setVms(userVMs);
    }
  };

  const handleSelectVM = (vmId) => {
    setSelectedVMs(prev => 
      prev.includes(vmId) 
        ? prev.filter(id => id !== vmId)
        : [...prev, vmId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVMs.length === vms.length) {
      setSelectedVMs([]);
    } else {
      setSelectedVMs(vms.map(vm => vm.id));
    }
  };

  const handleStartSelected = () => {
    if (selectedVMs.length === 0) {
      showToast('⚠️ Выберите серверы для запуска', 'warning');
      return;
    }

    showConfirmDialog(
      'Запуск серверов',
      `Запустить выбранные серверы (${selectedVMs.length})?`,
      'fa-play',
      () => {
        let successCount = 0;
        selectedVMs.forEach(vmId => {
          const vm = vms.find(v => v.id === vmId);
          if (vm.status === 'stopped') {
            const success = startVM(vmId, vm.userId);
            if (success) successCount++;
          }
        });

        if (successCount > 0) {
          showToast(`✅ Запущено серверов: ${successCount}`, 'success');
          setTimeout(() => loadVMs(), 1000);
        }
      }
    );
  };

  const handleStopSelected = () => {
    if (selectedVMs.length === 0) {
      showToast('⚠️ Выберите серверы для остановки', 'warning');
      return;
    }

    showConfirmDialog(
      'Остановка серверов',
      `Остановить выбранные серверы (${selectedVMs.length})?`,
      'fa-stop',
      () => {
        let successCount = 0;
        selectedVMs.forEach(vmId => {
          const vm = vms.find(v => v.id === vmId);
          if (vm.status === 'running') {
            const success = stopVM(vmId, vm.userId);
            if (success) successCount++;
          }
        });

        if (successCount > 0) {
          showToast(`⏸️ Остановлено серверов: ${successCount}`, 'info');
          setTimeout(() => loadVMs(), 1000);
        }
      }
    );
  };

  const handleDeleteSelected = () => {
    if (selectedVMs.length === 0) {
      showToast('⚠️ Выберите серверы для удаления', 'warning');
      return;
    }

    showConfirmDialog(
      '⚠️ Удаление серверов',
      `Удалить выбранные серверы (${selectedVMs.length})? Это действие нельзя отменить.`,
      'fa-trash',
      () => {
        let successCount = 0;
        selectedVMs.forEach(vmId => {
          const vm = vms.find(v => v.id === vmId);
          const success = deleteVM(vmId, vm.userId);
          if (success) successCount++;
        });

        showToast(`🗑️ Удалено серверов: ${successCount}`, 'warning');
        setSelectedVMs([]);
        setTimeout(() => loadVMs(), 1000);
      }
    );
  };

  const handleStartVM = (vm) => {
    if (vm.status === 'running') {
      showToast(`ℹ️ Сервер ${vm.name} уже работает`, 'info');
      return;
    }

    showConfirmDialog(
      'Запуск сервера',
      `Запустить сервер ${vm.name}?`,
      'fa-play',
      () => {
        if (startVM(vm.id, vm.userId)) {
          showToast(`✅ Сервер ${vm.name} запущен`, 'success');
          setTimeout(() => loadVMs(), 1000);
        }
      }
    );
  };

  const handleStopVM = (vm) => {
    if (vm.status === 'stopped') {
      showToast(`ℹ️ Сервер ${vm.name} уже остановлен`, 'info');
      return;
    }

    showConfirmDialog(
      'Остановка сервера',
      `Остановить сервер ${vm.name}?`,
      'fa-stop',
      () => {
        if (stopVM(vm.id, vm.userId)) {
          showToast(`⏸️ Сервер ${vm.name} остановлен`, 'info');
          setTimeout(() => loadVMs(), 1000);
        }
      }
    );
  };

  const handleDeleteVM = (vm) => {
    showConfirmDialog(
      '⚠️ Удаление сервера',
      `Удалить сервер ${vm.name}? Это действие нельзя отменить.`,
      'fa-trash',
      () => {
        if (deleteVM(vm.id, vm.userId)) {
          showToast(`🗑️ Сервер ${vm.name} удален`, 'warning');
          setTimeout(() => loadVMs(), 1000);
        }
      }
    );
  };

  const handleEditVM = (vm) => {
    openModal('editVM', { vmId: vm.id, userId: vm.userId });
  };

  const handleCreateVM = () => {
    // Проверка лимитов для пользователя
    if (!isAdmin) {
      const userData = getUserData();
      if (userData?.limits && vms.length >= userData.limits.maxVMs) {
        showToast(`❌ Достигнут лимит серверов (макс. ${userData.limits.maxVMs})`, 'error');
        return;
      }
    }
    openModal('createVM');
  };

  if (vms.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-server"></i>
        </div>
        <h1>{isAdmin ? 'Нет серверов в системе' : 'У вас пока нет серверов'}</h1>
        <p>{isAdmin ? 'Создайте первый сервер для пользователя' : 'Создайте свой первый сервер и начните работу с облаком'}</p>
        <div className="empty-state-actions">
          <button 
            className="action-btn primary" 
            onClick={handleCreateVM}
          >
            <i className="fas fa-plus"></i> {isAdmin ? 'Создать сервер для пользователя' : 'Создать сервер'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <button 
          className="action-btn primary" 
          onClick={handleCreateVM}
        >
          <i className="fas fa-plus"></i> {isAdmin ? 'Создать' : 'Создать'}
        </button>
        <button 
          className="action-btn" 
          onClick={handleStartSelected}
          disabled={selectedVMs.length === 0}
        >
          <i className="fas fa-play"></i> Запустить ({selectedVMs.length})
        </button>
        <button 
          className="action-btn" 
          onClick={handleStopSelected}
          disabled={selectedVMs.length === 0}
        >
          <i className="fas fa-stop"></i> Остановить ({selectedVMs.length})
        </button>
        <button 
          className="action-btn delete-btn" 
          onClick={handleDeleteSelected}
          disabled={selectedVMs.length === 0}
        >
          <i className="fas fa-trash"></i> Удалить ({selectedVMs.length})
        </button>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>{isAdmin ? 'Все серверы системы' : 'Мои серверы'} ({vms.length})</h3>
          <div className="header-actions">
            <span className="view-all" onClick={handleSelectAll}>
              {selectedVMs.length === vms.length ? 'Снять все' : 'Выбрать все'}
            </span>
            <span className="view-all filter-btn" onClick={handleCreateVM}>
              <i className="fas fa-plus"></i>
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="resource-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedVMs.length === vms.length && vms.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Имя</th>
                {isAdmin && <th className="desktop-only">Владелец</th>}
                <th>Статус</th>
                <th className="desktop-only">IP</th>
                <th>Конфигурация</th>
                <th className="desktop-only">ОС</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {vms.map(vm => (
                <tr key={vm.id} className={selectedVMs.includes(vm.id) ? 'selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedVMs.includes(vm.id)}
                      onChange={() => handleSelectVM(vm.id)}
                    />
                  </td>
                  <td className="vm-name-cell">
                    <div className="vm-name-container">
                      <strong>{vm.name}</strong>
                      <div className="vm-id">{vm.id.slice(-8)}</div>
                      {isMobile && (
                        <div className="mobile-info">
                          <div><span className="info-label">IP:</span> {vm.ip || '—'}</div>
                          <div><span className="info-label">ОС:</span> {vm.os}</div>
                          {isAdmin && <div><span className="info-label">Владелец:</span> {vm.userEmail}</div>}
                        </div>
                      )}
                    </div>
                  </td>
                  {isAdmin && <td className="desktop-only">{vm.userEmail}</td>}
                  <td>
                    <span className={`status-badge ${vm.status}`}>
                      {vm.status === 'running' ? 'Работает' : 'Остановлен'}
                    </span>
                  </td>
                  <td className="desktop-only">
                    <code>{vm.ip || '—'}</code>
                  </td>
                  <td className="vm-specs-cell">
                    <div className="vm-specs">
                      <div>{vm.cpu} vCPU / {vm.ram} GB</div>
                      <div className="mobile-only disk-info">{vm.disk} GB SSD</div>
                    </div>
                  </td>
                  <td className="desktop-only">
                    <i className={vm.osIcon || 'fab fa-linux'}></i> {vm.os}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {vm.status === 'stopped' ? (
                        <button 
                          className="icon-btn success" 
                          onClick={() => handleStartVM(vm)}
                          title="Запустить"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                      ) : (
                        <button 
                          className="icon-btn warning" 
                          onClick={() => handleStopVM(vm)}
                          title="Остановить"
                        >
                          <i className="fas fa-stop"></i>
                        </button>
                      )}
                      <button 
                        className="icon-btn" 
                        onClick={() => handleEditVM(vm)}
                        title="Настроить"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="icon-btn danger" 
                        onClick={() => handleDeleteVM(vm)}
                        title="Удалить"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-info">
          <i className="fas fa-info-circle"></i>
          Выбрано серверов: {selectedVMs.length} из {vms.length}
        </div>
      </div>
    </>
  );
};

export default ComputeVM;