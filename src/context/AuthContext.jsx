import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  USERS: 'mts_cloud_users',
  CURRENT_USER: 'mts_cloud_current_user',
  USER_DATA: (userId) => `mts_cloud_data_${userId}`
};

// Администратор
const ADMIN_USER = {
  id: 'admin_1',
  email: 'admin@gmail.com',
  password: '111111',
  fullName: 'Администратор Системы',
  company: 'МТС Cloud',
  phone: '+7 (495) 123-45-67',
  position: 'Главный администратор',
  role: 'admin',
  createdAt: new Date().toISOString(),
  lastLogin: null,
  settings: {
    theme: 'light',
    notifications: true,
    twoFactor: false
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Загрузка данных при инициализации
  useEffect(() => {
    const loadData = () => {
      try {
        // Загружаем список пользователей
        const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        let usersList = savedUsers ? JSON.parse(savedUsers) : [];
        
        // Добавляем администратора, если его нет
        const adminExists = usersList.some(u => u.email === ADMIN_USER.email);
        if (!adminExists) {
          usersList = [ADMIN_USER, ...usersList];
          
          // Создаем данные для администратора
          const adminData = {
            profile: {
              fullName: ADMIN_USER.fullName,
              email: ADMIN_USER.email,
              company: ADMIN_USER.company,
              phone: ADMIN_USER.phone,
              position: ADMIN_USER.position,
              registeredAt: ADMIN_USER.createdAt
            },
            // В данных пользователя и администратора
            region: 'Минск',  // вместо 'Москва',
            role: 'admin',
            notifications: [],
            resources: {
              vms: [],
              volumes: [],
              networks: []
            }
          };
          localStorage.setItem(STORAGE_KEYS.USER_DATA(ADMIN_USER.id), JSON.stringify(adminData));
        }
        
        setUsers(usersList);

        // Проверяем, есть ли текущий пользователь
        const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (savedCurrentUser) {
          setCurrentUser(JSON.parse(savedCurrentUser));
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Сохранение пользователей при изменении
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }, [users]);

  // Сохранение текущего пользователя при изменении
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // Регистрация нового пользователя
  const register = (email, password, profileData) => {
    return new Promise((resolve, reject) => {
      try {
        // Проверяем, существует ли пользователь
        const userExists = users.some(u => u.email === email);
        if (userExists) {
          reject(new Error('Пользователь с таким email уже существует'));
          return;
        }

        // Создаем нового пользователя
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email,
          password,
          ...profileData,
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLogin: null,
          settings: {
            theme: 'light',
            notifications: true,
            twoFactor: false
          }
        };

        // Добавляем в список пользователей
        setUsers(prev => [...prev, newUser]);

        // Создаем данные для пользователя
        const initialUserData = {
          profile: {
            ...profileData,
            email,
            registeredAt: newUser.createdAt
          },
          balance: 1000,
          region: 'Москва',
          role: 'user',
          notifications: [
            {
              id: 1,
              title: 'Добро пожаловать в МТС Cloud!',
              message: 'Рады видеть вас в нашей облачной платформе',
              time: 'только что',
              unread: true,
              icon: 'info-circle'
            },
            {
              id: 2,
              title: 'Приветственный бонус',
              message: 'Вам начислено 1000 ₽ для тестирования сервисов',
              time: 'только что',
              unread: true,
              icon: 'gift'
            }
          ],
          resources: {
            vms: [],
            volumes: [],
            networks: []
          }
        };

        localStorage.setItem(STORAGE_KEYS.USER_DATA(newUser.id), JSON.stringify(initialUserData));
        
        console.log('Новый пользователь зарегистрирован:', newUser);
        console.log('Текущие пользователи:', [...users, newUser]);

        resolve(newUser);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Вход пользователя
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('Попытка входа:', email, password);
        console.log('Существующие пользователи:', users);
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          reject(new Error('Неверный email или пароль'));
          return;
        }

        // Обновляем время последнего входа
        const updatedUser = { 
          ...user, 
          lastLogin: new Date().toISOString() 
        };
        
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        setCurrentUser(updatedUser);

        console.log('Вход выполнен:', updatedUser);

        resolve(updatedUser);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Выход пользователя
  const logout = () => {
    setCurrentUser(null);
  };

  // Получение данных пользователя
  const getUserData = (userId = null) => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return null;
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA(targetUserId));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      return null;
    }
  };

  // Получение всех пользователей (для админа)
  const getAllUsers = () => {
    return users.filter(u => u.email !== ADMIN_USER.email);
  };

  // Получение всех серверов всех пользователей (для админа)
  const getAllServers = () => {
    const allServers = [];
    users.forEach(user => {
      if (user.email !== ADMIN_USER.email) {
        const userData = getUserData(user.id);
        if (userData?.resources?.vms) {
          allServers.push(...userData.resources.vms.map(vm => ({
            ...vm,
            userId: user.id,
            userEmail: user.email,
            userName: user.fullName
          })));
        }
      }
    });
    return allServers;
  };

  // Сохранение данных пользователя
  const saveUserData = (data, userId = null) => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return false;
    
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA(targetUserId), JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения данных пользователя:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    getUserData,
    saveUserData,
    getAllUsers,
    getAllServers,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};