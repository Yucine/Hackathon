import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const AdminTickets = () => {
  const { showToast, showConfirmDialog } = useApp();
  const { getAllUsers } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const savedTickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    // Сортируем по дате (новые сверху)
    savedTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setTickets(savedTickets);
  };

  const getFilteredTickets = () => {
    if (filter === 'all') return tickets;
    return tickets.filter(t => t.status === filter);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="status-badge" style={{ background: '#ffebee', color: '#c62828' }}>Новая</span>;
      case 'processing': return <span className="status-badge" style={{ background: '#fff3e0', color: '#e65100' }}>В обработке</span>;
      case 'answered': return <span className="status-badge" style={{ background: '#e8f5e9', color: '#2e7d32' }}>Отвечено</span>;
      case 'closed': return <span className="status-badge" style={{ background: '#eceff1', color: '#546e7a' }}>Закрыта</span>;
      default: return <span className="status-badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'low': return <span className="priority-badge low">Низкий</span>;
      case 'medium': return <span className="priority-badge medium">Средний</span>;
      case 'high': return <span className="priority-badge high">Высокий</span>;
      case 'critical': return <span className="priority-badge critical">Критичный</span>;
      default: return <span className="priority-badge">{priority}</span>;
    }
  };

  const handleStatusChange = (ticketId, newStatus) => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return t;
    });
    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
    showToast(`Статус заявки изменен на "${newStatus}"`, 'success');
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      showToast('Введите текст ответа', 'warning');
      return;
    }

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        const newMessage = {
          id: (t.messages?.length || 0) + 1,
          author: 'admin',
          text: replyMessage,
          createdAt: new Date().toISOString()
        };
        return { 
          ...t, 
          messages: [...(t.messages || []), newMessage],
          status: 'answered',
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id));
    setReplyMessage('');
    showToast('Ответ отправлен', 'success');
  };

  const handleCloseTicket = (ticketId) => {
    showConfirmDialog(
      'Закрыть заявку',
      'Вы уверены, что хотите закрыть эту заявку?',
      'fa-check-circle',
      () => {
        handleStatusChange(ticketId, 'closed');
        setSelectedTicket(null);
      }
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    new: tickets.filter(t => t.status === 'new').length,
    processing: tickets.filter(t => t.status === 'processing').length,
    answered: tickets.filter(t => t.status === 'answered').length,
    total: tickets.length
  };

  return (
    <div className="admin-tickets">
      <h1>
        <i className="fas fa-ticket-alt" style={{ color: 'var(--mts-red)', marginRight: '12px' }}></i>
        Управление заявками поддержки
      </h1>

      {/* Статистика */}
      <div className="widget-grid" style={{ marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="card-title">Новые заявки</div>
          <div className="balance-large" style={{ color: '#c62828' }}>{stats.new}</div>
        </div>
        <div className="card stat-card">
          <div className="card-title">В обработке</div>
          <div className="balance-large" style={{ color: '#e65100' }}>{stats.processing}</div>
        </div>
        <div className="card stat-card">
          <div className="card-title">Отвечено</div>
          <div className="balance-large" style={{ color: '#2e7d32' }}>{stats.answered}</div>
        </div>
        <div className="card stat-card">
          <div className="card-title">Всего</div>
          <div className="balance-large">{stats.total}</div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="tickets-filter" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все заявки
        </button>
        <button 
          className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
          onClick={() => setFilter('new')}
        >
          Новые
        </button>
        <button 
          className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
          onClick={() => setFilter('processing')}
        >
          В обработке
        </button>
        <button 
          className={`filter-btn ${filter === 'answered' ? 'active' : ''}`}
          onClick={() => setFilter('answered')}
        >
          Отвеченные
        </button>
      </div>

      {selectedTicket ? (
        // Детальный просмотр заявки
        <div className="ticket-detail">
          <button className="action-btn" onClick={() => setSelectedTicket(null)} style={{ marginBottom: '20px' }}>
            <i className="fas fa-arrow-left"></i> Назад к списку
          </button>

          <div className="card">
            <div className="ticket-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>{selectedTicket.subject}</h2>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
              </div>
              <div>
                <select 
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                  className="status-select"
                >
                  <option value="new">Новая</option>
                  <option value="processing">В обработке</option>
                  <option value="answered">Отвечено</option>
                  <option value="closed">Закрыта</option>
                </select>
              </div>
            </div>

            <div className="ticket-info" style={{ background: 'var(--mts-gray-bg)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div className="info-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ color: 'var(--mts-gray)', fontSize: '12px' }}>Отправитель</div>
                  <div><strong>{selectedTicket.userName || selectedTicket.userEmail}</strong></div>
                  <div style={{ fontSize: '12px' }}>{selectedTicket.userEmail}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--mts-gray)', fontSize: '12px' }}>Категория</div>
                  <div>{selectedTicket.category === 'technical' ? 'Техническая проблема' :
                         selectedTicket.category === 'billing' ? 'Биллинг' :
                         selectedTicket.category === 'account' ? 'Аккаунт' : 'Другое'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--mts-gray)', fontSize: '12px' }}>Дата создания</div>
                  <div>{formatDate(selectedTicket.createdAt)}</div>
                </div>
              </div>
            </div>

            <div className="ticket-messages" style={{ marginBottom: '20px' }}>
              {selectedTicket.messages?.map((msg, idx) => (
                <div key={idx} className={`message ${msg.author === 'admin' ? 'admin' : 'user'}`} style={{
                  display: 'flex',
                  marginBottom: '16px',
                  justifyContent: msg.author === 'admin' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.author === 'admin' ? 'var(--mts-red)' : 'var(--mts-gray-bg)',
                    color: msg.author === 'admin' ? 'white' : 'var(--mts-black)'
                  }}>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {msg.author === 'admin' ? 'Администратор' : selectedTicket.userName}
                    </div>
                    <div style={{ fontSize: '14px' }}>{msg.text}</div>
                    <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
                      {formatDate(msg.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'closed' && (
              <div className="ticket-reply">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Введите ваш ответ..."
                  rows="4"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--mts-border)', marginBottom: '12px' }}
                ></textarea>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button className="modal-btn cancel" onClick={() => setSelectedTicket(null)}>
                    Отмена
                  </button>
                  <button className="modal-btn primary" onClick={handleSendReply}>
                    <i className="fas fa-paper-plane"></i> Отправить ответ
                  </button>
                  <button className="modal-btn" onClick={() => handleCloseTicket(selectedTicket.id)}>
                    <i className="fas fa-check"></i> Закрыть заявку
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Список заявок
        <div className="resources-section">
          <div className="table-responsive">
            <table className="resource-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Дата</th>
                  <th>Отправитель</th>
                  <th>Тема</th>
                  <th>Категория</th>
                  <th>Приоритет</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredTickets().map(ticket => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id.slice(-8)}</td>
                    <td>{formatDate(ticket.createdAt)}</td>
                    <td>
                      <div>{ticket.userName || ticket.userEmail}</div>
                      <div style={{ fontSize: '11px', color: 'var(--mts-gray)' }}>{ticket.userEmail}</div>
                    </td>
                    <td>{ticket.subject}</td>
                    <td>
                      {ticket.category === 'technical' ? 'Техническая' :
                       ticket.category === 'billing' ? 'Биллинг' :
                       ticket.category === 'account' ? 'Аккаунт' : 'Другое'}
                    </td>
                    <td>{getPriorityBadge(ticket.priority)}</td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>
                      <button 
                        className="icon-btn" 
                        onClick={() => setSelectedTicket(ticket)}
                        title="Просмотреть"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;