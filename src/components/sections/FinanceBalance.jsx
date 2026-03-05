import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const FinanceBalance = () => {
  const { balance, openModal, hasResources, getResources, isAdmin } = useApp();
  const { currentUser } = useAuth();
  const vms = getResources('vms');
  const volumes = getResources('volumes');

  // Если админ - показываем заглушку
  if (isAdmin) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-crown"></i>
        </div>
        <h1>Администратор</h1>
        <p>У вас нет баланса, так как вы являетесь администратором системы</p>
        <div className="empty-state-actions">
          <button className="action-btn primary" onClick={() => window.history.back()}>
            <i className="fas fa-arrow-left"></i> Вернуться
          </button>
        </div>
      </div>
    );
  }

  // Расчет расходов (имитация)
  const vmCost = vms.length * 500;
  const volumeCost = volumes.length * 100;
  const totalCost = vmCost + volumeCost;

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary" onClick={() => openModal('balance')}>
          <i className="fas fa-credit-card"></i> Пополнить баланс
        </div>
        <div className="action-btn">
          <i className="fas fa-history"></i> История операций
        </div>
      </div>

      <div className="widget-grid">
        <div className="card finance-widget">
          <div className="card-title"><i className="fas fa-wallet"></i> Текущий баланс</div>
          <div className="balance-large">{balance?.toFixed(2) || 0} ₽</div>
          <div className="service-row">
            <span>Заблокировано</span>
            <span>{hasResources ? '500.00 ₽' : '0.00 ₽'}</span>
          </div>
          <div className="service-row">
            <span>Доступно</span>
            <span className="mts-red">{(balance - (hasResources ? 500 : 0))?.toFixed(2) || 0} ₽</span>
          </div>
          <button 
            className="action-btn primary" 
            onClick={() => openModal('balance')} 
            style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
          >
            <i className="fas fa-credit-card"></i> Пополнить баланс
          </button>
        </div>

        <div className="card">
          <div className="card-title"><i className="fas fa-chart-line"></i> Расходы за месяц</div>
          <div className="balance-large">{totalCost.toFixed(2)} ₽</div>
          <div className="service-row">
            <span>ВМ ({vms.length})</span>
            <span>{vmCost} ₽</span>
          </div>
          <div className="service-row">
            <span>Диски ({volumes.length})</span>
            <span>{volumeCost} ₽</span>
          </div>
          <div className="service-row">
            <span>Прогноз на конец месяца</span>
            <span>≈ {totalCost * 2} ₽</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><i className="fas fa-credit-card"></i> Способы оплаты</div>
          <div className="payment-icons" style={{ justifyContent: 'flex-start', gap: '12px', marginTop: '8px' }}>
            <i className="fab fa-cc-visa" style={{ fontSize: '28px' }}></i>
            <i className="fab fa-cc-mastercard" style={{ fontSize: '28px' }}></i>
            <i className="fab fa-cc-mir" style={{ fontSize: '28px' }}></i>
            <i className="fas fa-mobile-alt" style={{ fontSize: '28px' }}></i>
          </div>
          <div className="service-row" style={{ marginTop: '12px' }}>
            <span>Основной способ</span>
            <span>Visa *4256</span>
          </div>
        </div>
      </div>

      {hasResources && (
        <div className="resources-section">
          <div className="resources-header">
            <h3>Последние операции</h3>
            <span className="view-all">Все операции →</span>
          </div>

          <table className="resource-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Описание</th>
                <th>Сумма</th>
                <th>Баланс после</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{new Date().toLocaleDateString()}</td>
                <td>Создание ВМ {vms[0]?.name}</td>
                <td style={{ color: 'var(--mts-gray-dark)' }}>-500.00 ₽</td>
                <td>{balance - 500} ₽</td>
                <td><span className="status-badge running">Завершено</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default FinanceBalance;