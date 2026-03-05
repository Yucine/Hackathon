import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { isAdmin, showToast } = useApp();

  // Функция-заглушка для неработающих разделов
  const handleNavClick = (e, path, label) => {
    // Список работающих разделов
    const workingSections = [
      '/section/compute-vm',
      '/section/support-knowledge',
      '/admin/tenants',
      '/admin/tickets',
      '/section/management-monitoring',
      '/section/finance-balance',
      '/section/finance-invoices'
    ];

    if (!workingSections.includes(path)) {
      e.preventDefault();
      showToast(`🚧 Раздел "${label}" находится в разработке`, 'info');
    }
  };

  // Базовые пункты меню
  const baseNavItems = [
    {
      section: 'Вычисления',
      items: [
        { path: '/section/compute-vm', icon: 'fa-server', label: 'Виртуальные машины', working: true },
        { path: '/section/compute-images', icon: 'fa-image', label: 'Образы / Шаблоны', working: false },
        { path: '/section/compute-backups', icon: 'fa-camera-retro', label: 'Резервное копирование', working: false }
      ]
    },
    {
      section: 'Хранилище',
      items: [
        { path: '/section/storage-volumes', icon: 'fa-database', label: 'Диски (Volumes)', working: false },
        { path: '/section/storage-files', icon: 'fa-folder-open', label: 'Файловые хранилища', working: false },
        { path: '/section/storage-s3', icon: 'fa-cloud-upload-alt', label: 'S3 / Объектное', working: false }
      ]
    },
    {
      section: 'Сеть',
      items: [
        { path: '/section/network-vpc', icon: 'fa-network-wired', label: 'Виртуальные сети (VPC)', working: false },
        { path: '/section/network-lb', icon: 'fa-balance-scale', label: 'Балансировщики', working: false },
        { path: '/section/network-firewall', icon: 'fa-shield-alt', label: 'Брандмауэр', working: false },
        { path: '/section/network-ip', icon: 'fa-globe', label: 'Плавающие IP', working: false }
      ]
    },
    {
      section: 'Управление',
      items: [
        { path: '/section/management-monitoring', icon: 'fa-chart-line', label: 'Мониторинг и логи', working: true },
        { path: '/section/management-audit', icon: 'fa-history', label: 'Аудит', working: false }
      ]
    }
  ];

  // Формируем меню в зависимости от роли
  let navItems = [...baseNavItems];

  if (isAdmin) {
    navItems = [
      {
        section: 'Администрирование',
        items: [
          { path: '/admin/tenants', icon: 'fa-building', label: 'Управление клиентами', working: true },
          { path: '/admin/tickets', icon: 'fa-ticket-alt', label: 'Заявки поддержки', working: true }
        ]
      },
      ...baseNavItems,
      {
        section: 'Финансы',
        items: [
          { path: '/section/finance-invoices', icon: 'fa-file-invoice', label: 'Счета и Акты', working: true }
        ]
      }
    ];
  } else {
    navItems = [
      {
        section: 'Поддержка',
        items: [
          { path: '/section/support-knowledge', icon: 'fa-headset', label: 'Поддержка', working: true }
        ]
      },
      ...baseNavItems,
      {
        section: 'Финансы',
        items: [
          { path: '/section/finance-balance', icon: 'fa-wallet', label: 'Баланс', working: true },
          { path: '/section/finance-invoices', icon: 'fa-file-invoice', label: 'Счета и Акты', working: true }
        ]
      }
    ];
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
              onClick={(e) => !item.working && handleNavClick(e, item.path, item.label)}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''} ${!item.working ? 'disabled' : ''}`
              }
              style={!item.working ? { opacity: 0.6, cursor: 'pointer' } : {}}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>
                {item.label}
                {!item.working && <span style={{ fontSize: '10px', marginLeft: '6px', color: 'var(--mts-gray)' }}>(в разработке)</span>}
              </span>
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