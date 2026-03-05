import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '+7',
    position: '',
    agreeTerms: false,
    agreeNews: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 - основная информация, 2 - контакты

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setError('Введите полное имя');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Введите email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Введите корректный email');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.phone || formData.phone.length < 5) {
      setError('Введите номер телефона');
      return false;
    }
    if (!formData.agreeTerms) {
      setError('Необходимо согласиться с условиями использования');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNext();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Регистрация с расширенными данными
      await register(
        formData.email,
        formData.password,
        {
          fullName: formData.fullName,
          company: formData.company,
          phone: formData.phone,
          position: formData.position,
          avatar: formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        }
      );
      
      navigate('/login', { 
        state: { 
          message: 'Регистрация успешна! Теперь вы можете войти.',
          email: formData.email
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">М</div>
        <div className="auth-title">
          <h1>МТС Cloud</h1>
          <p>Регистрация нового аккаунта {step}/2</p>
        </div>

        {/* Прогресс бар */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          padding: '0 20px'
        }}>
          <div style={{ 
            flex: 1, 
            height: '4px', 
            background: step >= 1 ? 'var(--mts-red)' : 'var(--mts-border)',
            borderRadius: '2px',
            transition: 'background 0.3s'
          }}></div>
          <div style={{ 
            flex: 1, 
            height: '4px', 
            background: step >= 2 ? 'var(--mts-red)' : 'var(--mts-border)',
            borderRadius: '2px',
            transition: 'background 0.3s'
          }}></div>
        </div>

        {error && (
          <div className="auth-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Шаг 1 - Основная информация */}
          {step === 1 && (
            <>
              <div className="auth-form-group">
                <label>
                  Полное имя <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Иванов Иван Иванович"
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ivanov@company.ru"
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>
                  Пароль <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 6 символов"
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>
                  Подтверждение пароля <span className="required">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Введите пароль еще раз"
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="auth-submit"
                disabled={loading}
              >
                Продолжить
              </button>
            </>
          )}

          {/* Шаг 2 - Контактная информация */}
          {step === 2 && (
            <>
              <div className="auth-form-group">
                <label>
                  Компания
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="ООО 'Компания'"
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>
                  Должность
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Системный администратор"
                  disabled={loading}
                />
              </div>

              <div className="auth-form-group">
                <label>
                  Телефон <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (999) 123-45-67"
                  disabled={loading}
                />
              </div>

              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={loading}
                />
                Я соглашаюсь с <a href="#">условиями использования</a> и <a href="#">политикой конфиденциальности</a>
              </label>

              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="agreeNews"
                  checked={formData.agreeNews}
                  onChange={handleChange}
                  disabled={loading}
                />
                Получать новости и обновления МТС Cloud
              </label>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="auth-submit"
                  onClick={handleBack}
                  style={{ background: 'var(--mts-gray-bg)', color: 'var(--mts-black)' }}
                  disabled={loading}
                >
                  Назад
                </button>
                <button 
                  type="submit" 
                  className="auth-submit"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Регистрация...
                    </>
                  ) : 'Зарегистрироваться'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;