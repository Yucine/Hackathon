import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { currentUser, getUserData, saveUserData, isAdmin, getAllUsers, getAllServers } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modals, setModals] = useState({
    region: false,
    notifications: false,
    balance: false,
    userMenu: false,
    createVM: false,
    editVM: false,
    userDetails: false,
    confirmDialog: false
  });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: '',
    message: '',
    icon: '',
    action: null
  });

  // Функция для принудительного обновления данных
  const refreshData = useCallback(() => {
    if (currentUser) {
      const data = getUserData();
      console.log('Обновление данных пользователя:', data);
      setUserData(data);
      setRefreshKey(prev => prev + 1);
    }
  }, [currentUser, getUserData]);

  // Загружаем данные пользователя при изменении currentUser
  useEffect(() => {
    if (currentUser) {
      const data = getUserData();
      console.log('Загруженные данные пользователя:', data);
      setUserData(data || {
        profile: {
          fullName: currentUser.fullName || '',
          email: currentUser.email,
          company: currentUser.company || '',
          phone: currentUser.phone || '',
          position: currentUser.position || '',
          registeredAt: currentUser.createdAt || new Date().toISOString()
        },
        balance: isAdmin ? 0 : 1000,
        region: 'Минск',
        role: currentUser.role || 'user',
        notifications: [
          {
            id: 1,
            title: 'Добро пожаловать в МТС Cloud!',
            message: 'Рады видеть вас в нашей облачной платформе',
            time: 'только что',
            unread: true,
            icon: 'info-circle'
          }
        ],
        resources: {
          vms: [],
          volumes: [],
          networks: []
        }
      });
    } else {
      setUserData(null);
    }
    setLoading(false);
  }, [currentUser, getUserData, refreshKey, isAdmin]);

  // Обновление данных пользователя
  const updateUserData = (newData, targetUserId = null) => {
    if (!currentUser && !targetUserId) return false;
    
    try {
      if (targetUserId) {
        const targetData = getUserData(targetUserId);
        if (targetData) {
          const updatedData = { ...targetData, ...newData };
          const saved = saveUserData(updatedData, targetUserId);
          console.log('Данные пользователя обновлены (target):', updatedData, 'Сохранено:', saved);
          return saved;
        }
      } else {
        const updatedData = { ...userData, ...newData };
        setUserData(updatedData);
        const saved = saveUserData(updatedData);
        console.log('Данные пользователя обновлены:', updatedData, 'Сохранено:', saved);
        return saved;
      }
      return false;
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
      return false;
    }
  };

  // Обновление баланса
  const updateBalance = (amount, userId = null) => {
    if (isAdmin) return false;
    
    if (userId) {
      const targetData = getUserData(userId);
      if (targetData) {
        const newBalance = (targetData.balance || 0) + amount;
        updateUserData({ balance: newBalance }, userId);
      }
    } else {
      const newBalance = (userData?.balance || 0) + amount;
      updateUserData({ balance: newBalance });
    }
  };

  // Обновление региона
  const setCurrentRegion = (region) => {
    updateUserData({ region });
  };

  // Добавление уведомления
  const addNotification = (notification, userId = null) => {
    if (userId) {
      const targetData = getUserData(userId);
      if (targetData) {
        const notifications = targetData.notifications || [];
        const newNotification = {
          id: Date.now(),
          time: 'только что',
          unread: true,
          ...notification
        };
        updateUserData({
          notifications: [newNotification, ...notifications].slice(0, 50)
        }, userId);
      }
    } else if (userData) {
      const notifications = userData.notifications || [];
      const newNotification = {
        id: Date.now(),
        time: 'только что',
        unread: true,
        ...notification
      };
      updateUserData({
        notifications: [newNotification, ...notifications].slice(0, 50)
      });
    }
  };

  // Отметить все уведомления как прочитанные
  const markAllNotificationsRead = () => {
    if (!userData?.notifications) return;
    updateUserData({
      notifications: userData.notifications.map(n => ({ ...n, unread: false }))
    });
  };

  // Показать диалог подтверждения
  const showConfirmDialog = (title, message, icon, action) => {
    setConfirmDialog({
      show: true,
      title,
      message,
      icon,
      action
    });
    setModals(prev => ({ ...prev, confirmDialog: true }));
  };

  // Скрыть диалог подтверждения
  const hideConfirmDialog = () => {
    setConfirmDialog({
      show: false,
      title: '',
      message: '',
      icon: '',
      action: null
    });
    setModals(prev => ({ ...prev, confirmDialog: false }));
  };

  // Создание виртуальной машины
  const createVM = (vmConfig, userId = null) => {
    console.log('createVM вызван с параметрами:', { vmConfig, userId });
    
    const targetUserId = userId || currentUser?.id;
    console.log('targetUserId:', targetUserId);
    
    if (!targetUserId) {
      console.error('Нет ID пользователя');
      return null;
    }

    let targetData;
    if (userId) {
      targetData = getUserData(userId);
    } else {
      targetData = userData;
    }
    
    console.log('targetData до создания:', targetData);
    
    if (!targetData) {
      console.error('Нет данных пользователя');
      return null;
    }

    // Убедимся, что resources существует
    if (!targetData.resources) {
      targetData.resources = { vms: [], volumes: [], networks: [] };
    }
    
    // Убедимся, что vms существует
    if (!targetData.resources.vms) {
      targetData.resources.vms = [];
    }

    const vms = targetData.resources.vms || [];

    const vmName = vmConfig.name || `server-${Date.now().toString().slice(-4)}`;

    const newVM = {
      id: `vm_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      name: vmName,
      status: 'stopped',
      ip: null,
      type: vmConfig.type || 's2.small',
      cpu: vmConfig.cpu || 2,
      ram: vmConfig.ram || 4,
      disk: vmConfig.disk || 50,
      os: vmConfig.os || 'Не установлена',
      osIcon: vmConfig.osIcon || 'fab fa-linux',
      createdAt: new Date().toISOString(),
      created: new Date().toLocaleString(),
      specs: {
        cpu: { total: vmConfig.cpu || 2, used: 0 },
        ram: { total: vmConfig.ram || 4, used: 0 },
        disk: { total: vmConfig.disk || 50, used: 0 }
      },
      network: {
        ip: null,
        bandwidth: 0,
        traffic: 0
      },
      traffic: {
        current: 0,
        limit: 1000,
        used: 0
      }
    };

    console.log('Создан новый VM объект:', newVM);

    // Обновляем ресурсы
    targetData.resources.vms = [...vms, newVM];

    console.log('Обновленные ресурсы:', targetData.resources);

    let success = false;
    if (userId) {
      success = saveUserData(targetData, userId);
      console.log('Сохранение для целевого пользователя:', success);
    } else {
      setUserData(targetData);
      success = saveUserData(targetData);
      console.log('Сохранение для текущего пользователя:', success);
    }

    console.log('Результат сохранения:', success);

    if (success) {
      if (userId) {
        addNotification({
          title: 'Создан сервер',
          message: `Администратор создал для вас сервер: ${newVM.name}`,
          icon: 'server'
        }, userId);
      } else {
        addNotification({
          title: 'Сервер создан',
          message: `Сервер ${newVM.name} успешно создан`,
          icon: 'check-circle'
        });
      }

      // Принудительно обновляем данные
      refreshData();
      
      // Отправляем событие для обновления других компонентов
      window.dispatchEvent(new CustomEvent('storage-update', { detail: { userId: targetUserId } }));
    }

    return newVM;
  };

  // Удаление виртуальной машины
  const deleteVM = (vmId, userId = null) => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return false;

    const targetData = userId ? getUserData(userId) : userData;
    if (!targetData?.resources?.vms) return false;

    const vms = targetData.resources.vms;
    const vmToDelete = vms.find(v => v.id === vmId);
    
    if (!vmToDelete) return false;

    const updatedVMs = vms.filter(v => v.id !== vmId);

    targetData.resources.vms = updatedVMs;

    if (userId) {
      saveUserData(targetData, userId);
      
      addNotification({
        title: 'Сервер удален',
        message: `Администратор удалил сервер: ${vmToDelete.name}`,
        icon: 'trash'
      }, userId);
    } else {
      setUserData(targetData);
      saveUserData(targetData);
    }

    refreshData();
    return true;
  };

  // Запуск виртуальной машины
  const startVM = (vmId, userId = null) => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return false;

    const targetData = userId ? getUserData(userId) : userData;
    if (!targetData?.resources?.vms) return false;

    const vms = targetData.resources.vms;
    const vmIndex = vms.findIndex(v => v.id === vmId);
    
    if (vmIndex === -1) return false;

    const newIP = `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    vms[vmIndex].status = 'running';
    vms[vmIndex].ip = newIP;

    if (userId) {
      saveUserData(targetData, userId);
      
      addNotification({
        title: 'Сервер запущен',
        message: `Сервер ${vms[vmIndex].name} запущен. IP: ${newIP}`,
        icon: 'play'
      }, userId);
    } else {
      setUserData(targetData);
      saveUserData(targetData);
    }

    refreshData();
    return true;
  };

  // Остановка виртуальной машины
  const stopVM = (vmId, userId = null) => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return false;

    const targetData = userId ? getUserData(userId) : userData;
    if (!targetData?.resources?.vms) return false;

    const vms = targetData.resources.vms;
    const vmIndex = vms.findIndex(v => v.id === vmId);
    
    if (vmIndex === -1) return false;

    vms[vmIndex].status = 'stopped';
    vms[vmIndex].ip = null;

    if (userId) {
      saveUserData(targetData, userId);
      
      addNotification({
        title: 'Сервер остановлен',
        message: `Сервер ${vms[vmIndex].name} остановлен`,
        icon: 'stop'
      }, userId);
    } else {
      setUserData(targetData);
      saveUserData(targetData);
    }

    refreshData();
    return true;
  };

  // Получение ресурсов определенного типа
  const getResources = (type, userId = null) => {
    if (userId) {
      const targetData = getUserData(userId);
      return targetData?.resources?.[type] || [];
    }
    return userData?.resources?.[type] || [];
  };

  // Получение конкретной ВМ по ID
  const getVMById = (vmId, userId = null) => {
    const vms = getResources('vms', userId);
    return vms.find(v => v.id === vmId);
  };

  // Получение данных пользователя для админа
  const getUserDetails = (userId) => {
    const user = getAllUsers().find(u => u.id === userId);
    const userData = getUserData(userId);
    return { user, data: userData };
  };

  // Проверка наличия ресурсов
  const hasResources = () => {
    if (!userData?.resources) return false;
    return Object.values(userData.resources).some(arr => arr && arr.length > 0);
  };

  // Количество непрочитанных уведомлений
  const unreadCount = userData?.notifications?.filter(n => n.unread).length || 0;

  // Управление модальными окнами
  const openModal = (modalName, data = null) => {
    setModals(prev => ({ 
      ...prev, 
      [modalName]: true,
      modalData: data 
    }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ 
      ...prev, 
      [modalName]: false,
      modalData: null 
    }));
  };

  const closeAllModals = () => {
    setModals({
      region: false,
      notifications: false,
      balance: false,
      userMenu: false,
      createVM: false,
      editVM: false,
      userDetails: false,
      confirmDialog: false,
      modalData: null
    });
    setConfirmDialog({
      show: false,
      title: '',
      message: '',
      icon: '',
      action: null
    });
  };

  // Показ уведомления (toast)
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    `;
    
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = type === 'success' ? '#10b981' : 
                                  type === 'error' ? '#ef4444' :
                                  type === 'warning' ? '#f59e0b' : '#3b82f6';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    toast.style.zIndex = '9999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.justifyContent = 'center';
    toast.style.gap = '8px';
    toast.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const value = {
    userData,
    balance: isAdmin ? 0 : (userData?.balance || 0),
    currentRegion: userData?.region || 'Минск',
    notifications: userData?.notifications || [],
    unreadCount,
    hasResources: hasResources(),
    isAdmin,
    
    updateBalance,
    updateUserData,
    setCurrentRegion,
    addNotification,
    markAllNotificationsRead,
    
    createVM,
    deleteVM,
    startVM,
    stopVM,
    getResources,
    getVMById,
    
    modals,
    openModal,
    closeModal,
    closeAllModals,
    
    showConfirmDialog,
    hideConfirmDialog,
    confirmDialog,
    
    showToast,
    refreshData,
    
    selectedUser,
    setSelectedUser,
    getUserDetails,
    
    getAllUsers: () => {
      try {
        return getAllUsers();
      } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        return [];
      }
    },
    getAllServers: () => {
      try {
        return getAllServers();
      } catch (error) {
        console.error('Ошибка получения серверов:', error);
        return [];
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Загрузка...
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      
      {/* Глобальный диалог подтверждения */}
      {confirmDialog.show && (
        <div className="modal-overlay active" onClick={hideConfirmDialog}>
          <div className="modal-content confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-header">
              <div className="confirm-icon">
                <i className={`fas ${confirmDialog.icon}`}></i>
              </div>
              <h3>{confirmDialog.title}</h3>
            </div>
            <div className="modal-body">
              <p className="confirm-message">{confirmDialog.message}</p>
            </div>
            <div className="confirm-footer">
              <button 
                className="confirm-btn cancel" 
                onClick={hideConfirmDialog}
              >
                <i className="fas fa-times"></i> Отмена
              </button>
              <button 
                className="confirm-btn confirm" 
                onClick={() => {
                  confirmDialog.action();
                  hideConfirmDialog();
                }}
              >
                <i className="fas fa-check"></i> Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};