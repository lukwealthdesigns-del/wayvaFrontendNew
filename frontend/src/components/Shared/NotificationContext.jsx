// components/Shared/NotificationContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from './Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(({ type, message, duration = 5000 }) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return showNotification({ type: 'success', message, duration });
  }, [showNotification]);

  const showError = useCallback((message, duration) => {
    return showNotification({ type: 'error', message, duration });
  }, [showNotification]);

  const showWarning = useCallback((message, duration) => {
    return showNotification({ type: 'warning', message, duration });
  }, [showNotification]);

  const showInfo = useCallback((message, duration) => {
    return showNotification({ type: 'info', message, duration });
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};