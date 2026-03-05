import React from 'react';
import { useApp } from '../../context/AppContext';

const ComputeImages = () => {
  const { getResources, createResource, hasResources, showToast } = useApp();
  const images = getResources('images');
  const systemImages = [
    { name: 'Ubuntu 22.04 LTS', size: '2.3 GB', type: 'system' },
    { name: 'CentOS 9 Stream', size: '1.8 GB', type: 'system' },
    { name: 'Windows Server 2022', size: '4.5 GB', type: 'system' },
    { name: 'Astra Linux', size: '2.1 GB', type: 'system' },
    { name: 'Debian 12', size: '1.2 GB', type: 'system' }
  ];

  const handleUploadImage = () => {
    const newImage = createResource('images', {
      name: `custom-image-${Date.now()}`,
      size: '2.5 GB',
      created: new Date().toLocaleDateString(),
      status: 'active'
    });

    if (newImage) {
      showToast('Образ загружен', 'success');
    }
  };

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={handleUploadImage}>
          <i className="fas fa-upload"></i> Загрузить образ
        </div>
        <div className="action-btn" onClick={() => showToast('Создание шаблона', 'info')}>
          <i className="fas fa-copy"></i> Создать шаблон
        </div>
      </div>

      <div className="widget-grid">
        <div className="card">
          <div className="card-title"><i className="fas fa-image"></i> Системные образы</div>
          {systemImages.map((img, idx) => (
            <div key={idx} className="service-row">
              {img.name} <span className="trend">{img.size}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-user"></i> Мои образы ({images.length})
          </div>
          {images.length > 0 ? (
            images.map(img => (
              <div key={img.id} className="service-row">
                {img.name} <span className="trend">{img.size}</span>
              </div>
            ))
          ) : (
            <div className="service-row" style={{ color: 'var(--mts-gray)' }}>
              Нет загруженных образов
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title"><i className="fas fa-clock"></i> Недавно использованные</div>
          <div className="service-row">ubuntu-22.04 <span className="trend">2 дня назад</span></div>
          <div className="service-row">windows-2022 <span className="trend">5 дней назад</span></div>
        </div>
      </div>
    </>
  );
};

export default ComputeImages;