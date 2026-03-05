import React from 'react';
import { useApp } from '../../context/AppContext';

const SupportTickets = () => {
  const { getResources, createResource, hasResources, showToast } = useApp();
  const tickets = getResources('tickets');

  const handleCreateTicket = () => {
    const newTicket = createResource('tickets', {
      number: `T-2024-${Math.floor(Math.random() * 1000)}`,
      subject: 'Новое обращение',
      date: new Date().toLocaleDateString(),
      status: 'processing',
      priority: 'Средний',
      messages: []
    });

    if (newTicket) {
      showToast('Тикет создан', 'success');
    }
  };

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={handleCreateTicket}>
          <i className="fas fa-plus-circle"></i> Создать тикет
        </div>
        <div className="action-btn" onClick={() => showToast('История обращений', 'info')}>
          <i className="fas fa-history"></i> История
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h3>Мои обращения {tickets.length > 0 ? `(${tickets.length})` : ''}</h3>
          <span className="view-all filter-btn" onClick={handleCreateTicket}>
            <i className="fas fa-plus"></i> Создать тикет
          </span>
        </div>

        {tickets.length > 0 ? (
          <table className="resource-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Тема</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Приоритет</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.number}</td>
                  <td>{ticket.subject}</td>
                  <td>{ticket.date}</td>
                  <td>
                    <span className={`status-badge ${ticket.status === 'closed' ? 'running' : 
                      ticket.status === 'processing' ? 'warning' : 'stopped'}`}
                      style={ticket.status === 'processing' ? { background: '#fff3e0', color: '#e65100' } : {}}>
                      {ticket.status === 'processing' ? 'В обработке' : 
                       ticket.status === 'closed' ? 'Закрыт' : 'Новый'}
                    </span>
                  </td>
                  <td>{ticket.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--mts-gray)' }}>
            <p>У вас пока нет обращений в поддержку</p>
            <button className="action-btn primary" onClick={handleCreateTicket} style={{ marginTop: '16px' }}>
              <i className="fas fa-plus-circle"></i> Создать первое обращение
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SupportTickets;