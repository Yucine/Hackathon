import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const BalanceModal = () => {
  const { balance, updateBalance, modals, closeModal, showToast, isAdmin } = useApp();
  const [amount, setAmount] = useState(1000);

  if (!modals.balance) return null;

  // Если админ - показываем другую информацию
  if (isAdmin) {
    return (
      <div className="modal-overlay active" onClick={() => closeModal('balance')}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Информация</h3>
            <i className="fas fa-times modal-close" onClick={() => closeModal('balance')}></i>
          </div>
          <div className="modal-body">
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <i className="fas fa-crown" style={{ fontSize: '48px', color: 'var(--mts-success)', marginBottom: '16px' }}></i>
              <h3>Администратор</h3>
              <p style={{ color: 'var(--mts-gray)', marginTop: '8px' }}>
                У вас нет баланса, так как вы являетесь администратором системы
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-btn primary" onClick={() => closeModal('balance')}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  const presets = [500, 1000, 5000, 10000];

  const handleConfirm = () => {
    if (amount > 0) {
      updateBalance(amount);
      showToast(`Баланс пополнен на ${amount} ₽`, 'success');
      closeModal('balance');
    }
  };

  return (
    <div className="modal-overlay active" onClick={() => closeModal('balance')}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Пополнение баланса</h3>
          <i className="fas fa-times modal-close" onClick={() => closeModal('balance')}></i>
        </div>
        <div className="modal-body">
          <div className="balance-info">
            <span>Текущий баланс:</span>
            <strong className="mts-red">{balance?.toFixed(2) || 0} ₽</strong>
          </div>
          <div className="balance-input-group">
            <label htmlFor="amount">Сумма пополнения (₽)</label>
            <input 
              type="number" 
              id="amount" 
              value={amount} 
              min="100" 
              step="100"
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="balance-presets">
            {presets.map((preset, idx) => (
              <button 
                key={idx}
                className="preset-btn"
                onClick={() => setAmount(preset)}
              >
                {preset} ₽
              </button>
            ))}
          </div>
          <div className="payment-methods">
            <p className="payment-methods-title">Способы оплаты:</p>
            <div className="payment-icons">
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-cc-mir"></i>
              <i className="fas fa-mobile-alt"></i>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={() => closeModal('balance')}>
            Отмена
          </button>
          <button className="modal-btn primary" onClick={handleConfirm}>
            Пополнить
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;