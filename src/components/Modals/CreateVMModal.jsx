import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const CreateVMModal = () => {
  const { modals, closeModal, createVM, showToast, refreshData } = useApp();
  const { isAdmin, getAllUsers } = useAuth();
  const [step, setStep] = useState(1);
  const [vmConfig, setVMConfig] = useState({
    name: '',
    type: 's2.small',
    cpu: 2,
    ram: 4,
    disk: 50,
    os: 'ubuntu-22.04',
    userId: ''
  });

  const vmTemplates = [
    { name: 's2.small', cpu: 2, ram: 4, disk: 50, price: 500 },
    { name: 's2.medium', cpu: 4, ram: 8, disk: 100, price: 1000 },
    { name: 's2.large', cpu: 8, ram: 16, disk: 200, price: 2000 },
    { name: 's2.xlarge', cpu: 16, ram: 32, disk: 400, price: 4000 }
  ];

  const osImages = [
    { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS', icon: 'fab fa-ubuntu' },
    { id: 'centos-9', name: 'CentOS 9 Stream', icon: 'fab fa-centos' },
    { id: 'debian-12', name: 'Debian 12', icon: 'fab fa-linux' },
    { id: 'windows-2022', name: 'Windows Server 2022', icon: 'fab fa-windows' },
    { id: 'astra-linux', name: 'Astra Linux', icon: 'fas fa-shield' }
  ];

  // Сбрасываем состояние при открытии
  useEffect(() => {
    if (modals.createVM) {
      setStep(1);
      setVMConfig({
        name: '',
        type: 's2.small',
        cpu: 2,
        ram: 4,
        disk: 50,
        os: 'ubuntu-22.04',
        userId: modals.modalData?.userId || ''
      });
    }
  }, [modals.createVM, modals.modalData]);

  if (!modals.createVM) return null;

  const users = isAdmin ? getAllUsers() : [];

  const handleTemplateSelect = (template) => {
    setVMConfig({
      ...vmConfig,
      type: template.name,
      cpu: template.cpu,
      ram: template.ram,
      disk: template.disk
    });
    setStep(2);
  };

  const handleCreate = () => {
    if (!vmConfig.name) {
      showToast('Введите имя сервера', 'warning');
      return;
    }

    if (isAdmin && !vmConfig.userId && !modals.modalData?.userId) {
      showToast('Выберите пользователя', 'warning');
      return;
    }

    const selectedOS = osImages.find(os => os.id === vmConfig.os);
    const targetUserId = modals.modalData?.userId || vmConfig.userId || null;
    
    const newVM = createVM({
      name: vmConfig.name,
      type: vmConfig.type,
      cpu: vmConfig.cpu,
      ram: vmConfig.ram,
      disk: vmConfig.disk,
      os: selectedOS?.name || 'Ubuntu 22.04 LTS',
      osIcon: selectedOS?.icon || 'fab fa-linux'
    }, targetUserId);

    if (newVM) {
      showToast('✅ Сервер успешно создан', 'success');
      closeModal('createVM');
      
      // Обновляем данные
      setTimeout(() => {
        refreshData();
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="modal-overlay active" onClick={() => closeModal('createVM')}>
      <div className="modal-content create-vm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <i className="fas fa-plus-circle" style={{ marginRight: '8px', color: 'var(--mts-red)' }}></i>
            Создание сервера {step}/2
          </h3>
          <i className="fas fa-times modal-close" onClick={() => closeModal('createVM')}></i>
        </div>

        <div className="modal-body">
          {/* Прогресс бар */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              flex: 1, 
              height: '4px', 
              background: step >= 1 ? 'var(--mts-red)' : 'var(--mts-border)',
              borderRadius: '2px'
            }}></div>
            <div style={{ 
              flex: 1, 
              height: '4px', 
              background: step >= 2 ? 'var(--mts-red)' : 'var(--mts-border)',
              borderRadius: '2px'
            }}></div>
          </div>

          {step === 1 && (
            <>
              <h4 style={{ marginBottom: '16px' }}>Выберите конфигурацию</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {vmTemplates.map((template, idx) => (
                  <div 
                    key={idx}
                    className={`template-card ${vmConfig.type === template.name ? 'selected' : ''}`}
                    onClick={() => handleTemplateSelect(template)}
                    style={{
                      padding: '16px',
                      border: `2px solid ${vmConfig.type === template.name ? 'var(--mts-red)' : 'var(--mts-border)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <i className="fas fa-cloud" style={{ fontSize: '24px', color: 'var(--mts-red)' }}></i>
                      <h4 style={{ margin: '8px 0' }}>{template.name}</h4>
                      <div style={{ fontSize: '13px', color: 'var(--mts-gray)' }}>
                        {template.cpu} vCPU • {template.ram} GB RAM
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--mts-gray)', marginBottom: '8px' }}>
                        {template.disk} GB SSD
                      </div>
                      {!isAdmin && (
                        <div style={{ fontWeight: '700', color: 'var(--mts-red)' }}>
                          {template.price} ₽/мес
                        </div>
                      )}
                      {isAdmin && (
                        <div style={{ 
                          fontWeight: '700', 
                          color: 'var(--mts-success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                          <i className="fas fa-plus-circle"></i> Для пользователя
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h4 style={{ marginBottom: '16px' }}>Настройка сервера</h4>
              
              <div className="auth-form-group">
                <label>Имя сервера</label>
                <input
                  type="text"
                  value={vmConfig.name}
                  onChange={(e) => setVMConfig({...vmConfig, name: e.target.value})}
                  placeholder="Например: web-server-01"
                  autoFocus
                />
              </div>

              <div className="auth-form-group">
                <label>Операционная система</label>
                <select 
                  value={vmConfig.os}
                  onChange={(e) => setVMConfig({...vmConfig, os: e.target.value})}
                  style={{ width: '100%', padding: '10px' }}
                >
                  {osImages.map(os => (
                    <option key={os.id} value={os.id}>{os.name}</option>
                  ))}
                </select>
              </div>

              {isAdmin && !modals.modalData?.userId && (
                <div className="auth-form-group">
                  <label>Пользователь</label>
                  <select 
                    value={vmConfig.userId}
                    onChange={(e) => setVMConfig({...vmConfig, userId: e.target.value})}
                    style={{ width: '100%', padding: '10px' }}
                  >
                    <option value="">Выберите пользователя</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.fullName || user.email} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ 
                background: 'var(--mts-gray-bg)', 
                padding: '16px', 
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <h5 style={{ marginBottom: '8px' }}>Выбранная конфигурация:</h5>
                <div className="service-row">
                  <span>Тип:</span>
                  <span><strong>{vmConfig.type}</strong></span>
                </div>
                <div className="service-row">
                  <span>Процессор:</span>
                  <span>{vmConfig.cpu} vCPU</span>
                </div>
                <div className="service-row">
                  <span>Память:</span>
                  <span>{vmConfig.ram} GB</span>
                </div>
                <div className="service-row">
                  <span>Диск:</span>
                  <span>{vmConfig.disk} GB SSD</span>
                </div>
                {!isAdmin && (
                  <div className="service-row">
                    <span>Стоимость:</span>
                    <span className="mts-red">
                      {vmTemplates.find(t => t.name === vmConfig.type)?.price || 500} ₽/мес
                    </span>
                  </div>
                )}
                {isAdmin && (
                  <div className="service-row">
                    <span>Действие:</span>
                    <span style={{ color: 'var(--mts-success)' }}>
                      <i className="fas fa-plus-circle"></i> Создать для пользователя
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {step === 2 && (
            <button 
              className="modal-btn" 
              onClick={() => setStep(1)}
            >
              Назад
            </button>
          )}
          <button 
            className="modal-btn cancel" 
            onClick={() => closeModal('createVM')}
          >
            Отмена
          </button>
          {step === 2 ? (
            <button 
              className="modal-btn primary" 
              onClick={handleCreate}
            >
              {isAdmin ? 'Создать для пользователя' : 'Создать сервер'}
            </button>
          ) : (
            <button 
              className="modal-btn primary" 
              onClick={() => setStep(2)}
              disabled={!vmConfig.type}
            >
              Далее
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateVMModal;