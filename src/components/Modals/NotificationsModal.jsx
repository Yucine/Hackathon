import React, { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const NotificationsModal = () => {
  const { notifications, modals, closeModal, markAllNotificationsRead } = useApp();
  const notificationsContainerRef = useRef(null);

  // Прокручиваем вверх при открытии
  useEffect(() => {
    if (modals.notifications && notificationsContainerRef.current) {
      notificationsContainerRef.current.scrollTop = 0;
    }
  }, [modals.notifications]);

  if (!modals.notifications) return null;

  // Форматирование времени
  const formatTime = (timeString) => {
    if (timeString === 'только что') return timeString;
    if (timeString.includes('минут')) return timeString;
    if (timeString.includes('час')) return timeString;
    if (timeString.includes('вчера')) return timeString;
    return timeString;
  };

  return (
    <div className="modal-overlay active" onClick={() => closeModal('notifications')}>
      <div className="modal-content notifications-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Уведомления</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {notifications.length > 0 && (
              <i 
                className="fas fa-check-double" 
                onClick={markAllNotificationsRead}
                style={{ cursor: 'pointer', color: 'var(--mts-gray)' }}
                title="Отметить все как прочитанные"
              ></i>
            )}
            <i className="fas fa-times modal-close" onClick={() => closeModal('notifications')}></i>
          </div>
        </div>
        <div className="modal-body notifications-container" ref={notificationsContainerRef}>
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : 'read'}`}>
                <i className={`fas fa-${notification.icon}`}></i>
                <div style={{ flex: 1 }}>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>{formatTime(notification.time)}</small>
                </div>
                {notification.unread && <span className="unread-dot"></span>}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--mts-gray)' }}>
              <i className="fas fa-bell-slash" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
              <p>Нет уведомлений</p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--mts-gray)', fontSize: '12px' }}>
              {notifications.filter(n => n.unread).length} непрочитанных
            </span>
            <button className="modal-btn" onClick={markAllNotificationsRead}>
              Отметить все
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsModal;