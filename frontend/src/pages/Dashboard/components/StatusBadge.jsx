import React from 'react';

const StatusBadge = ({ status, type = 'reservation' }) => {
  const getStatusClass = (status, type) => {
    if (type === 'reservation') {
      switch (status) {
        case 'approved':
          return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
        case 'pending':
          return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
        case 'rejected':
          return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
        case 'cancelled':
          return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        default:
          return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      }
    } else if (type === 'vehicle') {
      switch (status) {
        case 'active':
          return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
        case 'inactive':
          return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
        case 'maintenance':
          return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
        default:
          return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      }
    }
  };

  const getStatusText = (status, type) => {
    if (type === 'reservation') {
      switch (status) {
        case 'approved':
          return 'Onaylandı';
        case 'pending':
          return 'Beklemede';
        case 'rejected':
          return 'Reddedildi';
        case 'cancelled':
          return 'İptal Edildi';
        default:
          return status;
      }
    } else if (type === 'vehicle') {
      switch (status) {
        case 'active':
          return 'Aktif';
        case 'inactive':
          return 'Pasif';
        case 'maintenance':
          return 'Bakımda';
        default:
          return status;
      }
    }
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusClass(status, type)}`}>
      {getStatusText(status, type)}
    </span>
  );
};

export default StatusBadge;