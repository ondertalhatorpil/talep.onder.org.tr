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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
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
  };

  // Rezervasyon iptal fonksiyonu
  const handleCancelReservation = async (id) => {
    if (window.confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      try {
        await reservationService.cancelReservation(id, {
          notes: 'Kullanıcı tarafından iptal edildi'
        });

        setReservations(reservations.map(res =>
          res.id === id ? { ...res, status: 'cancelled' } : res
        ));
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

      // Rezervasyon listesini güncelle
      setReservations(reservations.map(res =>
        res.id === id ? { ...res, status: newStatus } : res
      ));
    } catch (err) {
      setError(`Rezervasyon durumu güncellenirken bir hata oluştu: ${err.response?.data?.message || err.message}`);
      console.error(err);
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

    const matchesSearch = searchTerm === '' ||
      searchFields.some(field => field.includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const now = new Date();
    const diffA = Math.abs(new Date(a.start_date_time) - now);
    const diffB = Math.abs(new Date(b.start_date_time) - now);
    return diffA - diffB;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
      setError(`Rezervasyon reddedilirken bir hata oluştu: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  };


  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
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