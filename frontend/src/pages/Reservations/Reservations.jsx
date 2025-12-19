import { useState, useEffect } from 'react';
import { reservationService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import ReservationHeader from './ReservationHeader';
import ReservationList from './ReservationList';
import RejectModal from './RejectModal';

const Reservations = () => {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [rejectingReservationId, setRejectingReservationId] = useState(null);

  const isAdmin = user?.role === 'admin';

 useEffect(() => {
  if (sortedReservations.length > 0) {
    const first = sortedReservations[0];
    console.log('🔍 DEBUG - Reservation Date Check:');
    console.log('Raw API value:', first.start_date_time);
    console.log('Type:', typeof first.start_date_time);
    console.log('Parsed Date:', new Date(first.start_date_time));
    console.log('ISO String:', new Date(first.start_date_time).toISOString());
    console.log('Local String (TR):', new Date(first.start_date_time).toLocaleString('tr-TR'));
    console.log('Format with date-fns:', format(new Date(first.start_date_time), 'PPP HH:mm', { locale: tr }));
  }
}, [sortedReservations]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await reservationService.getAllReservations();
        setReservations(data);
        setLoading(false);
      } catch (err) {
        setError('Rezervasyonlar yüklenirken bir hata oluştu');
        setLoading(false);
        console.error(err);
      }
    };
    fetchReservations();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-600 border-green-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      case 'cancelled': return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-gray-50 text-gray-800 border-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Onaylandı';
      case 'pending': return 'Beklemede';
      case 'rejected': return 'Reddedildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const handleCancelReservation = async (id) => {
    if (window.confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      try {
        await reservationService.cancelReservation(id, { notes: 'Kullanıcı tarafından iptal edildi' });
        setReservations(reservations.map(res => res.id === id ? { ...res, status: 'cancelled' } : res));
      } catch (err) {
        setError('Rezervasyon iptal edilirken bir hata oluştu');
        console.error(err);
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    if (!isAdmin) return;
    try {
      await reservationService.updateReservationStatus(id, {
        status: newStatus,
        notes: newStatus === 'approved' ? 'Yönetici tarafından onaylandı' : 'Yönetici tarafından reddedildi'
      });
      setReservations(reservations.map(res => res.id === id ? { ...res, status: newStatus } : res));
    } catch (err) {
      setError(`Hata: ${err.response?.data?.message || err.message}`);
    }
  };

  const openRejectModal = (id) => {
    setRejectingReservationId(id);
    setRejectReasonText('');
    setRejectModalOpen(true);
  };

  const handleRejectReservation = async () => {
    if (!rejectingReservationId) return;
    try {
      const rejectionReason = rejectReasonText.trim() || 'Yönetici tarafından reddedildi';
      await reservationService.updateReservationStatus(rejectingReservationId, {
        status: 'rejected',
        notes: rejectionReason
      });
      setReservations(reservations.map(res =>
        res.id === rejectingReservationId ? { ...res, status: 'rejected', notes: rejectionReason } : res
      ));
      setRejectModalOpen(false);
      setRejectingReservationId(null);
      setRejectReasonText('');
    } catch (err) {
      setError(`Rezervasyon reddedilirken bir hata oluştu: ${err.message}`);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const searchFields = [
      reservation.license_plate,
      reservation.brand,
      reservation.model,
      reservation.username,
      reservation.department,
      reservation.purpose
    ].filter(Boolean).map(field => field.toLowerCase());
    const matchesSearch = searchTerm === '' || searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const now = new Date();
    return Math.abs(new Date(a.start_date_time) - now) - Math.abs(new Date(b.start_date_time) - now);
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      <ReservationHeader
        isAdmin={isAdmin}
        error={error}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <ReservationList
        sortedReservations={sortedReservations}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
        getStatusClass={getStatusClass}
        getStatusText={getStatusText}
        handleUpdateStatus={handleUpdateStatus}
        handleCancelReservation={handleCancelReservation}
        openRejectModal={openRejectModal}
        isAdmin={isAdmin}
      />
      
      <RejectModal
        rejectModalOpen={rejectModalOpen}
        setRejectModalOpen={setRejectModalOpen}
        rejectReasonText={rejectReasonText}
        setRejectReasonText={setRejectReasonText}
        handleRejectReservation={handleRejectReservation}
      />
    </div>
  );
};

export default Reservations;