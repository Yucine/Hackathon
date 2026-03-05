import React from 'react';
import { useNavigate } from 'react-router-dom';

const SupportKnowledge = () => {
  const navigate = useNavigate();

  const popularArticles = [
    { title: 'Настройка высокодоступного кластера', category: 'Администрирование', views: 12345, updated: '10.03.2024' },
    { title: 'Миграция с VMware на МТС Cloud', category: 'Миграция', views: 8921, updated: '05.03.2024' },
    { title: 'Настройка VPN-подключения', category: 'Сеть', views: 7456, updated: '28.02.2024' },
    { title: 'Резервное копирование и восстановление', category: 'Бэкапы', views: 6234, updated: '20.02.2024' },
    { title: 'Управление доступом и ролями', category: 'Безопасность', views: 5432, updated: '15.02.2024' }
  ];

  const handleArticleClick = (title) => {
    // В реальном приложении здесь был бы переход на статью
    alert(`Открыть статью: ${title}`);
  };

  return (
    <>
      <div className="quick-actions">
        <div className="search-global" style={{ width: '100%', maxWidth: '600px' }}>
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Поиск в базе знаний..." />
        </div>
      </div>

      <div className="widget-grid">
        <div className="card" onClick={() => handleArticleClick('Начало работы')} style={{ cursor: 'pointer' }}>
          <div className="card-title"><i className="fas fa-rocket"></i> Начало работы</div>
          <ul className="event-feed">
            <li className="event-item">✓ Создание первой виртуальной машины</li>
            <li className="event-item">✓ Настройка сети и безопасности</li>
            <li className="event-item">✓ Подключение по SSH/RDP</li>
            <li className="event-item">✓ Управление дисками</li>
          </ul>
        </div>

        <div className="card" onClick={() => handleArticleClick('Частые вопросы')} style={{ cursor: 'pointer' }}>
          <div className="card-title"><i className="fas fa-question-circle"></i> Частые вопросы</div>
          <ul className="event-feed">
            <li className="event-item">• Как изменить тарифный план?</li>
            <li className="event-item">• Как восстановить данные из бэкапа?</li>
            <li className="event-item">• Как настроить мониторинг?</li>
            <li className="event-item">• Как подключить SSL-сертификат?</li>
          </ul>
        </div>

        <div className="card" onClick={() => handleArticleClick('Документация API')} style={{ cursor: 'pointer' }}>
          <div className="card-title"><i className="fas fa-file-alt"></i> Документация API</div>
          <ul className="event-feed">
            <li className="event-item">📘 REST API Reference</li>
            <li className="event-item">📗 SDK для Python</li>
            <li className="event-item">📕 SDK для Node.js</li>
            <li className="event-item">📙 Terraform Provider</li>
          </ul>
        </div>
      </div>

      <div className="resources-section">
        <h3>Популярные статьи</h3>
        <table className="resource-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Категория</th>
              <th>Просмотры</th>
              <th>Обновлено</th>
            </tr>
          </thead>
          <tbody>
            {popularArticles.map((article, idx) => (
              <tr key={idx} onClick={() => handleArticleClick(article.title)} style={{ cursor: 'pointer' }}>
                <td>{article.title}</td>
                <td>{article.category}</td>
                <td>{article.views.toLocaleString()}</td>
                <td>{article.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button className="action-btn" onClick={() => navigate('/section/support-tickets')}>
          <i className="fas fa-headset"></i> Связаться с поддержкой
        </button>
      </div>
    </>
  );
};

export default SupportKnowledge;