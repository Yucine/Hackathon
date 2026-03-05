import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const FinanceInvoices = () => {
  const { hasResources, getResources, showToast } = useApp();
  const { currentUser } = useAuth();
  const vms = getResources('vms');

  // Генерируем счета на основе активности пользователя
  const invoices = [];

  if (hasResources && vms.length > 0) {
    const now = new Date();
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      
      invoices.push({
        number: `МТС-2024-${10000 + i}`,
        date: date.toLocaleDateString(),
        period: `${date.toLocaleString('ru', { month: 'long' })} ${date.getFullYear()}`,
        amount: vms.length * 1500,
        status: 'paid'
      });
    }
  }

  const handleDownloadInvoice = (invoiceNumber) => {
    showToast(`Скачивание счета ${invoiceNumber}`, 'info');
  };

  if (!hasResources || invoices.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-file-invoice"></i>
        </div>
        <h1>Нет счетов для отображения</h1>
        <p>Счета появятся после создания платных ресурсов</p>
      </div>
    );
  }

  return (
    <>
      <div className="quick-actions">
        <div className="action-btn primary"><i className="fas fa-file-pdf"></i> Скачать все счета</div>
        <div className="action-btn"><i className="fas fa-calendar"></i> Выбрать период</div>
      </div>

      <div className="resources-section">
        <h3>Счета и акты</h3>
        <table className="resource-table">
          <thead>
            <tr>
              <th>№ счета</th>
              <th>Дата</th>
              <th>Период</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, idx) => (
              <tr key={idx}>
                <td>{invoice.number}</td>
                <td>{invoice.date}</td>
                <td>{invoice.period}</td>
                <td>{invoice.amount.toFixed(2)} ₽</td>
                <td>
                  <span className="status-badge running">
                    Оплачен
                  </span>
                </td>
                <td>
                  <i 
                    className="fas fa-download action-icon" 
                    onClick={() => handleDownloadInvoice(invoice.number)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default FinanceInvoices;