import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { isAdmin } = useApp();

  const navItems = [
    {
      section: 'Вычисления',
      items: [
        { path: '/section/compute-vm', icon: 'fa-server', label: 'Виртуальные машины' },
        { path: '/section/compute-images', icon: 'fa-image', label: 'Образы / Шаблоны' },
        { path: '/section/compute-backups', icon: 'fa-camera-retro', label: 'Резервное копирование' }
      ]
    },
    {
      section: 'Хранилище',
      items: [
        { path: '/section/storage-volumes', icon: 'fa-database', label: 'Диски (Volumes)' },
        { path: '/section/storage-files', icon: 'fa-folder-open', label: 'Файловые хранилища' },
        { path: '/section/storage-s3', icon: 'fa-cloud-upload-alt', label: 'S3 / Объектное' }
      ]
    },
    {
      section: 'Сеть',
      items: [
        { path: '/section/network-vpc', icon: 'fa-network-wired', label: 'Виртуальные сети (VPC)' },
        { path: '/section/network-lb', icon: 'fa-balance-scale', label: 'Балансировщики' },
        { path: '/section/network-firewall', icon: 'fa-shield-alt', label: 'Брандмауэр' },
        { path: '/section/network-ip', icon: 'fa-globe', label: 'Плавающие IP' }
      ]
    },
    {
      section: 'Управление',
      items: [
        { path: '/section/management-monitoring', icon: 'fa-chart-line', label: 'Мониторинг и логи' },
        { path: '/section/management-audit', icon: 'fa-history', label: 'Аудит' }
      ]
    },
    {
      section: 'Финансы',
      items: [
        { path: '/section/finance-balance', icon: 'fa-wallet', label: 'Баланс' },
        { path: '/section/finance-invoices', icon: 'fa-file-invoice', label: 'Счета и Акты' }
      ]
    },
    {
      section: 'Поддержка',
      items: [
        { path: '/section/support-tickets', icon: 'fa-headset', label: 'Тикеты' },
        { path: '/section/support-knowledge', icon: 'fa-book', label: 'База знаний' }
      ]
    }
  ];

  // Добавляем раздел для администратора
  if (isAdmin) {
    navItems.unshift({
      section: 'Администрирование',
      items: [
        { path: '/admin/tenants', icon: 'fa-building', label: 'Управление клиентами' }
      ]
    });
  }

  return (
    <div className="sidebar">
      <div className="logo-area" onClick={() => navigate('/')}>
        <div className="logo-icon">М</div>
        <span className="logo-text">МТС Cloud</span>
        <span className="logo-badge">IaaS</span>
      </div>

      {navItems.map((section, idx) => (
        <div key={idx} className="nav-section">
          <div className="nav-section-title">{section.section}</div>
          {section.items.map((item, itemIdx) => (
            <NavLink
              key={itemIdx}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="support-phone">
          <i className="fas fa-phone-alt"></i> 8 800 250-08-90
        </div>
        <div className="support-hours">
          Круглосуточно
        </div>
      </div>
    </div>
  );
};

export default Sidebar;