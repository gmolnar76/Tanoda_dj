/**
 * NotificationPanel Component
 * ===========================
 *
 * Displays notifications, rewards, and achievements.
 */

import React, { useEffect } from 'react';
import { useLearningStore } from '../store';
import type { Notification, Reward } from '../types';

// ============================================================================
// NOTIFICATION ITEM
// ============================================================================

interface NotificationItemProps {
  notification: Notification;
  onDismiss: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'level_completed':
        return '🎉';
      case 'level_regressed':
        return '📉';
      case 'streak_milestone':
        return '🔥';
      case 'level_reset':
        return '🔄';
      case 'mode_changed':
        return '🔀';
      case 'error':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getClassName = () => {
    let classes = ['notification-item', `type-${notification.type}`];
    return classes.join(' ');
  };

  // Auto-dismiss after 5 seconds for non-error notifications
  useEffect(() => {
    if (notification.type !== 'error') {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.type, onDismiss]);

  return (
    <div className={getClassName()}>
      <span className="notification-icon">{getIcon()}</span>
      <div className="notification-content">
        <p className="notification-message">{notification.message}</p>
        {notification.data?.new_level !== undefined && (
          <span className="notification-detail">
            Új szint: {notification.data.new_level as number}
          </span>
        )}
        {notification.data?.streak !== undefined && (
          <span className="notification-detail">
            Sorozat: {notification.data.streak as number}
          </span>
        )}
      </div>
      <button className="notification-dismiss" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
};

// ============================================================================
// REWARD DISPLAY
// ============================================================================

interface RewardDisplayProps {
  reward: Reward;
}

const RewardDisplay: React.FC<RewardDisplayProps> = ({ reward }) => {
  const getIcon = () => {
    switch (reward.type) {
      case 'level_completion':
        return '🏆';
      case 'streak_bonus':
        return '🔥';
      case 'challenge_win':
        return '🥇';
      default:
        return '⭐';
    }
  };

  const getLabel = () => {
    switch (reward.type) {
      case 'level_completion':
        return `Szint ${reward.level} teljesítve!`;
      case 'streak_bonus':
        return 'Sorozat bónusz!';
      case 'challenge_win':
        return 'Kihívás nyertes!';
      default:
        return 'Jutalom!';
    }
  };

  return (
    <div className="reward-display">
      <span className="reward-icon">{getIcon()}</span>
      <div className="reward-content">
        <span className="reward-label">{getLabel()}</span>
        <span className="reward-points">+{reward.points} pont</span>
      </div>
    </div>
  );
};

// ============================================================================
// ACHIEVEMENT POPUP
// ============================================================================

interface AchievementPopupProps {
  title: string;
  description: string;
  icon: string;
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  title,
  description,
  icon,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="achievement-popup">
      <div className="achievement-content">
        <span className="achievement-icon">{icon}</span>
        <div className="achievement-text">
          <h4 className="achievement-title">{title}</h4>
          <p className="achievement-description">{description}</p>
        </div>
      </div>
      <button className="achievement-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

// ============================================================================
// MAIN PANEL
// ============================================================================

const NotificationPanel: React.FC = () => {
  const { ui, clearNotification } = useLearningStore();

  if (ui.notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-panel">
      {ui.notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => clearNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationPanel;
export { NotificationItem, RewardDisplay, AchievementPopup };
