import React from 'react';
import { Badge } from '../ui/Badge';

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  return <Badge variant="auto" statusText={status} className={className} />;
};
