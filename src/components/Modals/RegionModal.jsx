import React from 'react';
import { useApp } from '../../context/AppContext';

const RegionModal = () => {
  const { currentRegion, setCurrentRegion, modals, closeModal } = useApp();

  const regions = [
    { name: 'Минск', desc: 'Центральный регион, столица', icon: 'fas fa-city' },
    { name: 'Гомель', desc: 'Юго-восточный регион', icon: 'fas fa-tree' },
    { name: 'Могилев', desc: 'Восточный регион', icon: 'fas fa-mountain' },
    { name: 'Витебск', desc: 'Северный регион', icon: 'fas fa-water' },
    { name: 'Гродно', desc: 'Западный регион', icon: 'fas fa-church' },
    { name: 'Брест', desc: 'Юго-западный регион', icon: 'fas fa-fort' }
  ];

  if (!modals.region) return null;

  const handleSelectRegion = (regionName) => {
    setCurrentRegion(regionName);
    closeModal('region');
    
    // Показываем системное сообщение
    const toast = document.createElement('div');
    toast.className = 'toast toast-info';
    toast.innerHTML = `
      <i class="fas fa-globe"></i>
      <span>Регион изменен на ${regionName}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  return (
    <div className="modal-overlay active" onClick={() => closeModal('region')}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>
            Выберите регион
          </h3>
          <i className="fas fa-times modal-close" onClick={() => closeModal('region')}></i>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--mts-gray)', marginBottom: '16px', fontSize: '13px' }}>
            Доступные регионы Беларуси
          </p>
          {regions.map((region, idx) => (
            <div 
              key={idx}
              className={`region-option ${currentRegion === region.name ? 'active' : ''}`}
              onClick={() => handleSelectRegion(region.name)}
              data-region={region.name}
            >
              <i className={region.icon}></i>
              <div>
                <strong>{region.name}</strong>
                <p className="region-desc">{region.desc}</p>
              </div>
              {currentRegion === region.name && <span className="region-check">✓</span>}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <span style={{ color: 'var(--mts-gray)', fontSize: '12px' }}>
            <i className="fas fa-info-circle"></i> Выберите ближайший регион
          </span>
          <button className="modal-btn primary" onClick={() => closeModal('region')}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionModal;