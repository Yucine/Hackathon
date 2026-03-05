import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const FinanceBalance = () => {
  const { balance, openModal, getResources, showToast } = useApp();
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  
  const vms = getResources('vms');
  const volumes = getResources('volumes');
  const networks = getResources('networks');

  // Расчет расходов
  const vmCost = vms.reduce((acc, vm) => acc + (vm.type === 's2.small' ? 500 : 
                                               vm.type === 's2.medium' ? 1000 :
                                               vm.type === 's2.large' ? 2000 : 4000), 0);
  const volumeCost = volumes.length * 100;
  const networkCost = networks.length * 50;
  const trafficCost = vms.reduce((acc, vm) => acc + (vm.traffic?.used || 0) * 10, 0);
  
  const totalCost = vmCost + volumeCost + networkCost + trafficCost;

  // Данные для круговой диаграммы
  const pieData = {
    labels: ['Виртуальные машины', 'Диски', 'Сетевые ресурсы', 'Трафик'],
    datasets: [
      {
        data: [vmCost, volumeCost, networkCost, trafficCost],
        backgroundColor: [
          '#e30613',
          '#3498db',
          '#f39c12',
          '#2ecc71'
        ],
        borderColor: [
          '#ffffff',
          '#ffffff',
          '#ffffff',
          '#ffffff'
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((value / totalCost) * 100);
            return `${label}: ${value} ₽ (${percentage}%)`;
          }
        }
      }
    }
  };

  // История транзакций
  const transactions = [
    { date: '2024-03-15', description: 'Оплата ВМ web-server-01', amount: -450, type: 'expense' },
    { date: '2024-03-14', description: 'Пополнение баланса', amount: 1000, type: 'income' },
    { date: '2024-03-13', description: 'Оплата диска volume-data', amount: -100, type: 'expense' },
    { date: '2024-03-12', description: 'Оплата сетевого трафика', amount: -89.50, type: 'expense' },
    { date: '2024-03-10', description: 'Пополнение баланса', amount: 2000, type: 'income' },
  ];

  return (
    <div className="finance-balance">
      <h1>
        <i className="fas fa-wallet" style={{ color: 'var(--mts-red)', marginRight: '12px' }}></i>
        Финансовый баланс
      </h1>

      {/* Баланс и пополнение */}
      <div className="widget-grid" style={{ marginBottom: '24px' }}>
        <div className="card finance-widget" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">
            <i className="fas fa-credit-card"></i> Текущий баланс
          </div>
          <div className="balance-large" style={{ fontSize: '48px' }}>{balance} ₽</div>
          <div className="service-row">
            <span>Заблокировано под ресурсы:</span>
            <span className="mts-red">{totalCost} ₽</span>
          </div>
          <div className="service-row">
            <span>Доступно:</span>
            <span className="mts-red">{balance - totalCost} ₽</span>
          </div>
          <button 
            className="action-btn primary" 
            onClick={() => openModal('balance')}
            style={{ marginTop: '16px', width: '100%' }}
          >
            <i className="fas fa-plus-circle"></i>
            Пополнить баланс
          </button>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-chart-line"></i> Расходы за месяц
          </div>
          <div className="balance-large" style={{ fontSize: '36px' }}>{totalCost} ₽</div>
          <div className="service-row">
            <span>ВМ ({vms.length})</span>
            <span>{vmCost} ₽</span>
          </div>
          <div className="service-row">
            <span>Диски ({volumes.length})</span>
            <span>{volumeCost} ₽</span>
          </div>
          <div className="service-row">
            <span>Сеть</span>
            <span>{networkCost} ₽</span>
          </div>
          <div className="service-row">
            <span>Трафик</span>
            <span>{trafficCost} ₽</span>
          </div>
        </div>
      </div>

      {/* Круговая диаграмма */}
      <div className="widget-grid" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">
            <i className="fas fa-chart-pie"></i> Структура расходов
          </div>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            {totalCost > 0 ? (
              <div style={{ width: '400px' }}>
                <Pie data={pieData} options={pieOptions} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--mts-gray)' }}>
                Нет данных о расходах
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-chart-bar"></i> Сводка
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-label">Средний расход в день</div>
              <div className="stat-value">{(totalCost / 30).toFixed(2)} ₽</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Прогноз на месяц</div>
              <div className="stat-value">{totalCost} ₽</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Самый дорогой ресурс</div>
              <div className="stat-value">
                {Math.max(vmCost, volumeCost, networkCost, trafficCost) === vmCost ? 'ВМ' :
                 Math.max(vmCost, volumeCost, networkCost, trafficCost) === volumeCost ? 'Диски' :
                 Math.max(vmCost, volumeCost, networkCost, trafficCost) === networkCost ? 'Сеть' : 'Трафик'}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Экономия</div>
              <div className="stat-value" style={{ color: '#10b981' }}>0 ₽</div>
            </div>
          </div>
        </div>
      </div>

      {/* История транзакций */}
      <div className="resources-section">
        <div className="resources-header">
          <h3>История транзакций</h3>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="quarter">За квартал</option>
            <option value="year">За год</option>
          </select>
        </div>

        <table className="resource-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Описание</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, idx) => (
              <tr key={idx}>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td>{t.description}</td>
                <td style={{ color: t.type === 'income' ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                  {t.type === 'income' ? '+' : ''}{t.amount} ₽
                </td>
                <td>
                  <span className={`status-badge ${t.type === 'income' ? 'running' : 'stopped'}`}>
                    {t.type === 'income' ? 'Зачисление' : 'Списание'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Информационные карточки */}
      <div className="widget-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-title">
            <i className="fas fa-gift"></i> Бонусы
          </div>
          <div className="balance-large">250</div>
          <div className="service-row">
            <span>Бонусные баллы</span>
            <span className="trend">+50 в этом месяце</span>
          </div>
          <div className="service-row">
            <span>Сгорает через</span>
            <span className="mts-red">45 дней</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-percent"></i> Тарифный план
          </div>
          <div className="service-row">
            <span>Текущий тариф</span>
            <span><strong>Корпоративный</strong></span>
          </div>
          <div className="service-row">
            <span>Скидка</span>
            <span className="mts-red">15%</span>
          </div>
          <div className="service-row">
            <span>Следующее списание</span>
            <span>01.04.2024</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-credit-card"></i> Способы оплаты
          </div>
          <div className="payment-icons" style={{ justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
            <i className="fab fa-cc-visa" style={{ fontSize: '32px', color: '#1a1f71' }}></i>
            <i className="fab fa-cc-mastercard" style={{ fontSize: '32px', color: '#eb001b' }}></i>
            <i className="fab fa-cc-mir" style={{ fontSize: '32px', color: '#0080c8' }}></i>
            <i className="fas fa-mobile-alt" style={{ fontSize: '32px', color: '#34a853' }}></i>
          </div>
          <div className="service-row">
            <span>Основной способ</span>
            <span>Visa *4256</span>
          </div>
          <button className="action-btn" style={{ width: '100%', marginTop: '12px' }}>
            <i className="fas fa-plus"></i> Добавить способ
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceBalance;