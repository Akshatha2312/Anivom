import React from 'react';

const StatusBadge = ({ status, type = 'order' }) => {
  const getBadgeStyle = () => {
    if (type === 'refund') {
      switch (status) {
        case 'PENDING':
          return { bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', color: '#ca8a04', label: 'Refund processing' };
        case 'REFUNDED':
          return { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', color: '#16a34a', label: 'Refund completed' };
        case 'FAILED':
          return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#dc2626', label: 'Refund failed — review required' };
        case 'NONE':
        default:
          return { bg: 'rgba(100, 116, 139, 0.15)', border: '#64748b', color: '#475569', label: status || 'NONE' };
      }
    }

    if (type === 'payment') {
      switch (status) {
        case 'PAID':
          return { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', color: '#16a34a' };
        case 'PENDING':
          return { bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', color: '#ca8a04' };
        case 'FAILED':
          return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', color: '#dc2626' };
        default:
          return { bg: 'rgba(100, 116, 139, 0.15)', border: '#64748b', color: '#475569' };
      }
    }

    switch (status) {
      case 'PLACED':
        return { bg: 'rgba(14, 165, 233, 0.15)', border: '#0ea5e9', color: '#0284c7' };
      case 'CONFIRMED':
        return { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', color: '#4f46e5' };
      case 'PROCESSING':
        return { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', color: '#9333ea' };
      case 'SHIPPED':
        return { bg: 'rgba(198, 161, 91, 0.2)', border: '#C6A15B', color: '#b48a3c' };
      case 'DELIVERED':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', color: '#16a34a' };
      case 'RETURN_REQUESTED':
        return { bg: 'rgba(122, 31, 61, 0.18)', border: '#7A1F3D', color: '#7A1F3D', label: 'RETURN REQUESTED' };
      case 'RETURN_APPROVED':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', color: '#16a34a', label: 'RETURN APPROVED' };
      case 'RETURN_REJECTED':
        return { bg: 'rgba(198, 93, 59, 0.2)', border: '#C65D3B', color: '#C65D3B', label: 'RETURN REJECTED' };
      case 'CANCELLED':
      case 'FAILED':
        return { bg: 'rgba(198, 93, 59, 0.2)', border: '#C65D3B', color: '#C65D3B' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', border: '#64748b', color: '#475569' };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '2px',
        fontSize: '0.72rem',
        fontWeight: '700',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
      }}
    >
      {style.label || status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
