import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const SupportKnowledge = () => {
  const { showToast } = useApp();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    message: '',
    attachments: []
  });

  const faqCategories = [
    {
      title: 'Начало работы',
      icon: 'fa-rocket',
      questions: [
        { q: 'Как создать виртуальную машину?', a: 'Перейдите в раздел "Виртуальные машины" и нажмите кнопку "Создать". Выберите конфигурацию, ОС и укажите имя сервера.' },
        { q: 'Как подключиться к серверу?', a: 'После создания сервера вы получите IP-адрес. Используйте SSH-клиент для подключения (для Linux) или RDP для Windows.' },
        { q: 'Сколько стоит использование?', a: 'Цены зависят от выбранной конфигурации. Базовая конфигурация s2.small стоит 500 ₽/мес.' }
      ]
    },
    {
      title: 'Биллинг и оплата',
      icon: 'fa-credit-card',
      questions: [
        { q: 'Как пополнить баланс?', a: 'Нажмите на баланс в верхнем меню или перейдите в раздел "Баланс" для пополнения.' },
        { q: 'Когда списываются средства?', a: 'Списание происходит ежедневно за фактическое использование ресурсов.' },
        { q: 'Как получить закрывающие документы?', a: 'Счета и акты доступны в разделе "Счета и Акты" после оплаты.' }
      ]
    },
    {
      title: 'Технические вопросы',
      icon: 'fa-cog',
      questions: [
        { q: 'Как увеличить ресурсы сервера?', a: 'В разделе управления сервером вы можете изменить конфигурацию. Изменения применяются после перезагрузки.' },
        { q: 'Как настроить бэкапы?', a: 'Перейдите в раздел "Резервное копирование" и создайте правило с нужным расписанием.' },
        { q: 'Как добавить SSH-ключ?', a: 'В настройках сервера есть раздел "SSH-ключи", где можно добавить публичный ключ.' }
      ]
    },
    {
      title: 'Безопасность',
      icon: 'fa-shield-alt',
      questions: [
        { q: 'Как настроить firewall?', a: 'В разделе "Брандмауэр" можно создать правила для входящего и исходящего трафика.' },
        { q: 'Как защитить данные?', a: 'Регулярно создавайте бэкапы и используйте сложные пароли. Рекомендуем включить двухфакторную аутентификацию.' }
      ]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      showToast('Заполните все обязательные поля', 'warning');
      return;
    }

    // Создаем тикет в localStorage
    const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    const newTicket = {
      id: `TICKET_${Date.now()}`,
      userId: currentUser?.id,
      userName: currentUser?.fullName,
      userEmail: currentUser?.email,
      ...formData,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        id: 1,
        author: 'user',
        text: formData.message,
        createdAt: new Date().toISOString()
      }]
    };
    
    tickets.push(newTicket);
    localStorage.setItem('support_tickets', JSON.stringify(tickets));
    
    showToast('Заявка отправлена! Мы свяжемся с вами в ближайшее время', 'success');
    
    // Очищаем форму
    setFormData({
      subject: '',
      category: 'technical',
      priority: 'medium',
      message: '',
      attachments: []
    });
    
    setActiveTab('faq');
  };

  return (
    <div className="support-knowledge">
      <h1>
        <i className="fas fa-headset" style={{ color: 'var(--mts-red)', marginRight: '12px' }}></i>
        Центр поддержки
      </h1>

      {/* Вкладки */}
      <div className="tabs-container" style={{ marginBottom: '30px' }}>
        <button
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          <i className="fas fa-question-circle"></i>
          Часто задаваемые вопросы
        </button>
        <button
          className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
          onClick={() => setActiveTab('ticket')}
        >
          <i className="fas fa-ticket-alt"></i>
          Создать заявку
        </button>
      </div>

      {activeTab === 'faq' && (
        <div className="faq-section">
          <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {faqCategories.map((category, idx) => (
              <div key={idx} className="card faq-category">
                <div className="card-title">
                  <i className={`fas ${category.icon}`}></i>
                  {category.title}
                </div>
                <div className="faq-list">
                  {category.questions.map((item, qIdx) => (
                    <div key={qIdx} className="faq-item">
                      <div className="faq-question">
                        <i className="fas fa-question-circle"></i>
                        {item.q}
                      </div>
                      <div className="faq-answer">
                        <i className="fas fa-answer-circle"></i>
                        {item.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="support-contacts" style={{ marginTop: '30px', textAlign: 'center' }}>
            <h3>Не нашли ответ?</h3>
            <p>Свяжитесь с нами любым удобным способом</p>
            <div className="contact-methods" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
              <div className="contact-item">
                <i className="fas fa-phone-alt" style={{ fontSize: '24px', color: 'var(--mts-red)' }}></i>
                <div>8 800 250-08-90</div>
                <small>Круглосуточно</small>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope" style={{ fontSize: '24px', color: 'var(--mts-red)' }}></i>
                <div>support@mts-cloud.ru</div>
                <small>Ответ в течение часа</small>
              </div>
              <div className="contact-item">
                <i className="fas fa-telegram" style={{ fontSize: '24px', color: 'var(--mts-red)' }}></i>
                <div>@mts_cloud_support</div>
                <small>Telegram</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ticket' && (
        <div className="ticket-form-section">
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-title">
              <i className="fas fa-ticket-alt"></i>
              Новая заявка в поддержку
            </div>
            <form onSubmit={handleSubmitTicket}>
              <div className="form-group">
                <label>Тема обращения *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Кратко опишите проблему"
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Категория</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="technical">Техническая проблема</option>
                    <option value="billing">Биллинг и оплата</option>
                    <option value="account">Управление аккаунтом</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Приоритет</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange}>
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                    <option value="critical">Критичный</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Описание проблемы *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Опишите проблему подробно. Укажите ID сервера, если проблема связана с конкретным ресурсом"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Вложения (необязательно)</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFormData({...formData, attachments: Array.from(e.target.files)})}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    Выберите файлы или перетащите их сюда
                  </label>
                  {formData.attachments.length > 0 && (
                    <div className="selected-files">
                      {formData.attachments.map((file, idx) => (
                        <div key={idx} className="file-tag">
                          <i className="fas fa-file"></i>
                          {file.name}
                          <i 
                            className="fas fa-times" 
                            onClick={() => {
                              const newFiles = [...formData.attachments];
                              newFiles.splice(idx, 1);
                              setFormData({...formData, attachments: newFiles});
                            }}
                          ></i>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="modal-btn cancel" onClick={() => setActiveTab('faq')}>
                  Отмена
                </button>
                <button type="submit" className="modal-btn primary">
                  <i className="fas fa-paper-plane"></i>
                  Отправить заявку
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportKnowledge;