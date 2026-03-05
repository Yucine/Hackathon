import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ManagementMonitoring = () => {
  const { getResources, hasResources, isAdmin, getAllServers } = useApp();
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedServer, setSelectedServer] = useState('all');
  const [chartData, setChartData] = useState({
    cpu: { labels: [], datasets: [] },
    ram: { labels: [], datasets: [] },
    disk: { labels: [], datasets: [] },
    network: { labels: [], datasets: [] }
  });
  
  // Получаем данные
  const userVMs = getResources('vms');
  const allServers = isAdmin ? getAllServers() : [];
  const vms = isAdmin ? allServers : userVMs;

  // Оптимальные значения для каждого ресурса
  const optimalValues = {
    cpu: 40,
    ram: 60,
    disk: 70,
    network: 50
  };

  const [currentMetrics, setCurrentMetrics] = useState({
    cpu: 0,
    ram: 0,
    disk: 0,
    network: 0
  });

  // Генерируем метки времени
  const generateLabels = () => {
    const labels = [];
    const now = new Date();
    const points = timeRange === '1h' ? 20 : timeRange === '6h' ? 24 : 24;
    
    for (let i = points - 1; i >= 0; i--) {
      const time = new Date(now - i * 180000); // 3 минуты интервал
      if (timeRange === '1h') {
        labels.push(`${time.getMinutes()}:${time.getSeconds().toString().padStart(2, '0')}`);
      } else {
        labels.push(`${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`);
      }
    }
    return labels;
  };

  // Генерируем исторические данные
  const generateHistoryData = (baseValue, volatility = 15, points = 20) => {
    const data = [];
    let currentValue = baseValue;
    for (let i = 0; i < points; i++) {
      currentValue = currentValue + (Math.random() - 0.5) * volatility;
      currentValue = Math.max(0, Math.min(100, currentValue));
      data.push(Math.round(currentValue * 10) / 10);
    }
    return data;
  };

  // Генерируем линию оптимальных значений
  const generateOptimalLine = (optimalValue, points) => {
    return Array(points).fill(optimalValue);
  };

  // Обновление данных при изменении выбранного сервера
  useEffect(() => {
    const targetVMs = selectedServer === 'all' 
      ? vms 
      : vms.filter(v => v.id === selectedServer);

    if (targetVMs.length === 0) {
      const labels = generateLabels();
      const points = labels.length;
      const emptyData = generateHistoryData(0, 5, points);
      const optimalData = generateOptimalLine(optimalValues.cpu, points);
      
      setChartData({
        cpu: {
          labels,
          datasets: [
            {
              label: 'Фактическое значение',
              data: emptyData,
              borderColor: '#e30613',
              backgroundColor: 'rgba(227, 6, 19, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Оптимальное значение',
              data: optimalData,
              borderColor: '#10b981',
              borderDash: [5, 5],
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
              tension: 0
            }
          ]
        },
        ram: {
          labels,
          datasets: [
            {
              label: 'Фактическое значение',
              data: emptyData,
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Оптимальное значение',
              data: generateOptimalLine(optimalValues.ram, points),
              borderColor: '#10b981',
              borderDash: [5, 5],
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
              tension: 0
            }
          ]
        },
        disk: {
          labels,
          datasets: [
            {
              label: 'Фактическое значение',
              data: emptyData,
              borderColor: '#f39c12',
              backgroundColor: 'rgba(243, 156, 18, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Оптимальное значение',
              data: generateOptimalLine(optimalValues.disk, points),
              borderColor: '#10b981',
              borderDash: [5, 5],
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
              tension: 0
            }
          ]
        },
        network: {
          labels,
          datasets: [
            {
              label: 'Фактическое значение',
              data: emptyData,
              borderColor: '#2ecc71',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Оптимальное значение',
              data: generateOptimalLine(optimalValues.network, points),
              borderColor: '#10b981',
              borderDash: [5, 5],
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
              tension: 0
            }
          ]
        }
      });
      
      setCurrentMetrics({
        cpu: 0,
        ram: 0,
        disk: 0,
        network: 0
      });
      
      return;
    }

    // Рассчитываем средние значения
    const avgCPU = targetVMs.reduce((sum, vm) => 
      sum + (vm.status === 'running' ? (vm.specs?.cpu?.used || 15 + Math.random() * 20) : 0), 0
    ) / Math.max(targetVMs.length, 1);

    const avgRAM = targetVMs.reduce((sum, vm) => 
      sum + (vm.status === 'running' ? (vm.specs?.ram?.used || 25 + Math.random() * 30) : 0), 0
    ) / Math.max(targetVMs.length, 1);

    const avgDisk = targetVMs.reduce((sum, vm) => 
      sum + (vm.specs?.disk?.used || 20 + Math.random() * 15), 0
    ) / Math.max(targetVMs.length, 1);

    const avgNetwork = targetVMs.reduce((sum, vm) => 
      sum + (vm.status === 'running' ? (vm.network?.bandwidth || 30 + Math.random() * 40) : 0), 0
    ) / Math.max(targetVMs.length, 1);

    const labels = generateLabels();
    const points = labels.length;
    
    setChartData({
      cpu: {
        labels,
        datasets: [
          {
            label: 'Фактическое значение',
            data: generateHistoryData(avgCPU, 12, points),
            borderColor: '#e30613',
            backgroundColor: 'rgba(227, 6, 19, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Оптимальное значение',
            data: generateOptimalLine(optimalValues.cpu, points),
            borderColor: '#10b981',
            borderDash: [5, 5],
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0
          }
        ]
      },
      ram: {
        labels,
        datasets: [
          {
            label: 'Фактическое значение',
            data: generateHistoryData(avgRAM, 8, points),
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Оптимальное значение',
            data: generateOptimalLine(optimalValues.ram, points),
            borderColor: '#10b981',
            borderDash: [5, 5],
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0
          }
        ]
      },
      disk: {
        labels,
        datasets: [
          {
            label: 'Фактическое значение',
            data: generateHistoryData(avgDisk, 3, points),
            borderColor: '#f39c12',
            backgroundColor: 'rgba(243, 156, 18, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Оптимальное значение',
            data: generateOptimalLine(optimalValues.disk, points),
            borderColor: '#10b981',
            borderDash: [5, 5],
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0
          }
        ]
      },
      network: {
        labels,
        datasets: [
          {
            label: 'Фактическое значение',
            data: generateHistoryData(avgNetwork, 15, points),
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Оптимальное значение',
            data: generateOptimalLine(optimalValues.network, points),
            borderColor: '#10b981',
            borderDash: [5, 5],
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0
          }
        ]
      }
    });

    setCurrentMetrics({
      cpu: Math.round(avgCPU * 10) / 10,
      ram: Math.round(avgRAM * 10) / 10,
      disk: Math.round(avgDisk * 10) / 10,
      network: Math.round(avgNetwork * 10) / 10
    });

  }, [vms, selectedServer, timeRange]);

  // Автообновление
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const targetVMs = selectedServer === 'all' 
        ? vms 
        : vms.filter(v => v.id === selectedServer);

      if (targetVMs.length === 0) return;

      const avgCPU = targetVMs.reduce((sum, vm) => 
        sum + (vm.status === 'running' ? (vm.specs?.cpu?.used || 15 + Math.random() * 20) : 0), 0
      ) / Math.max(targetVMs.length, 1);

      const avgRAM = targetVMs.reduce((sum, vm) => 
        sum + (vm.status === 'running' ? (vm.specs?.ram?.used || 25 + Math.random() * 30) : 0), 0
      ) / Math.max(targetVMs.length, 1);

      setCurrentMetrics(prev => ({
        ...prev,
        cpu: Math.round(avgCPU * 10) / 10,
        ram: Math.round(avgRAM * 10) / 10
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [vms, selectedServer, autoRefresh]);

  // Опции для графиков
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#333',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  const networkChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: function(value) {
            return value + ' Мбит/с';
          }
        }
      }
    }
  };

  const getHealthColor = (value, optimal) => {
    if (value <= optimal * 1.2) return '#10b981';
    if (value <= optimal * 1.5) return '#f59e0b';
    return '#ef4444';
  };

  if (!hasResources && !isAdmin) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <i className="fas fa-chart-line"></i>
        </div>
        <h1>Нет данных для мониторинга</h1>
        <p>Создайте сервер для просмотра метрик</p>
        <button className="action-btn primary" onClick={() => {}}>
          <i className="fas fa-plus"></i> Создать сервер
        </button>
      </div>
    );
  }

  return (
    <div className="monitoring-dashboard">
      <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>
        <i className="fas fa-chart-line" style={{ color: 'var(--mts-red)', marginRight: '12px' }}></i>
        Мониторинг и логи
      </h1>

      {/* Панель управления */}
      <div className="quick-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            className="action-btn"
            style={{ minWidth: '200px' }}
          >
            <option value="all">Все серверы</option>
            {vms.map(vm => (
              <option key={vm.id} value={vm.id}>
                {vm.name} ({vm.status === 'running' ? 'Работает' : 'Остановлен'})
              </option>
            ))}
          </select>

          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="action-btn"
          >
            <option value="1h">Последний час</option>
            <option value="6h">6 часов</option>
            <option value="24h">24 часа</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <label className="action-btn" style={{ cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Автообновление
          </label>
        </div>
      </div>

      {/* Текущие метрики */}
      <div className="widget-grid" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div className="card-title">
            <i className="fas fa-microchip" style={{ color: '#e30613' }}></i> CPU
          </div>
          <div className="balance-large" style={{ fontSize: '36px', color: getHealthColor(currentMetrics.cpu, optimalValues.cpu) }}>
            {currentMetrics.cpu}%
          </div>
          <div className="service-row">
            <span>Оптимально:</span>
            <span>{optimalValues.cpu}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginTop: '8px' }}>
            <div className="progress-fill" style={{ 
              width: `${currentMetrics.cpu}%`, 
              background: getHealthColor(currentMetrics.cpu, optimalValues.cpu)
            }}></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-memory" style={{ color: '#3498db' }}></i> RAM
          </div>
          <div className="balance-large" style={{ fontSize: '36px', color: getHealthColor(currentMetrics.ram, optimalValues.ram) }}>
            {currentMetrics.ram}%
          </div>
          <div className="service-row">
            <span>Оптимально:</span>
            <span>{optimalValues.ram}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginTop: '8px' }}>
            <div className="progress-fill" style={{ 
              width: `${currentMetrics.ram}%`, 
              background: getHealthColor(currentMetrics.ram, optimalValues.ram)
            }}></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-hdd" style={{ color: '#f39c12' }}></i> Диск
          </div>
          <div className="balance-large" style={{ fontSize: '36px', color: getHealthColor(currentMetrics.disk, optimalValues.disk) }}>
            {currentMetrics.disk}%
          </div>
          <div className="service-row">
            <span>Оптимально:</span>
            <span>{optimalValues.disk}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginTop: '8px' }}>
            <div className="progress-fill" style={{ 
              width: `${currentMetrics.disk}%`, 
              background: getHealthColor(currentMetrics.disk, optimalValues.disk)
            }}></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-network-wired" style={{ color: '#2ecc71' }}></i> Сеть
          </div>
          <div className="balance-large" style={{ fontSize: '36px', color: getHealthColor(currentMetrics.network, optimalValues.network) }}>
            {currentMetrics.network} Мбит/с
          </div>
          <div className="service-row">
            <span>Оптимально:</span>
            <span>{optimalValues.network} Мбит/с</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginTop: '8px' }}>
            <div className="progress-fill" style={{ 
              width: `${currentMetrics.network}%`, 
              background: getHealthColor(currentMetrics.network, optimalValues.network)
            }}></div>
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className="widget-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">
            <i className="fas fa-microchip"></i> Загрузка CPU
          </div>
          <div style={{ height: '300px' }}>
            {chartData.cpu.labels && chartData.cpu.labels.length > 0 && (
              <Line data={chartData.cpu} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-memory"></i> Использование RAM
          </div>
          <div style={{ height: '250px' }}>
            {chartData.ram.labels && chartData.ram.labels.length > 0 && (
              <Line data={chartData.ram} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <i className="fas fa-hdd"></i> Дисковая активность
          </div>
          <div style={{ height: '250px' }}>
            {chartData.disk.labels && chartData.disk.labels.length > 0 && (
              <Line data={chartData.disk} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">
            <i className="fas fa-network-wired"></i> Сетевой трафик
          </div>
          <div style={{ height: '250px' }}>
            {chartData.network.labels && chartData.network.labels.length > 0 && (
              <Line data={chartData.network} options={networkChartOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementMonitoring;