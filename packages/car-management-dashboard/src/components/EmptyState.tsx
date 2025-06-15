import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { emptyStateStyles } from './EmptyState.css';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className={emptyStateStyles.container}>
      <div className={emptyStateStyles.content}>
        {icon && <div className={emptyStateStyles.icon}>{icon}</div>}
        <h3 className={emptyStateStyles.title}>{title}</h3>
        <p className={emptyStateStyles.description}>{description}</p>
        <button onClick={onAction} className={emptyStateStyles.button}>
          <FontAwesomeIcon icon={faPlus} />
          {actionLabel}
        </button>
      </div>
    </div>
  );
}; 