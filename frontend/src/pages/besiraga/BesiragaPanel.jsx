// frontend/src/pages/besiraga/BesiragaPanel.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { besiragaService, ROOM_INFO } from '../../services/besiragaApi';

const BesiragaPanel = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    room_name: 'Yemekhane',
    group_name: '',
    start_datetime: '',
    end_datetime: '',
    capacity: 40,
    contact_person: '',
    phone: '',
    notes: ''
  });
  const navigate = useNavigate();
  const password = sessionStorage.getItem('besiraga_password');

  useEffect(() => {
    if (!password) {
      navigate('/besiraga/admin');
      return;
    }
    fetchReservations();
  }, [password, navigate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await besiragaService.getAllReservations();
      setReservations(response.data || []);
    } catch (error) {
      console.error('Rezervasyonları yüklerken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (reservation = null) => {
    if (reservation) {
      setEditingReservation(reservation);
      setFormData({
        room_name: reservation.room_name,
        group_name: reservation.group_name,
        start_datetime: reservation.start_datetime.slice(0, 16),
        end_datetime: reservation.end_datetime.slice(0, 16),
        capacity: reservation.capacity,
        contact_person: reservation.contact_person || '',
        phone: reservation.phone || '',
        notes: reservation.notes || ''
      });
    } else {
      setEditingReservation(null);
      setFormData({
        room_name: 'Yemekhane',
        group_name: '',
        start_datetime: '',
        end_datetime: '',
        capacity: 40,
        contact_person: '',
        phone: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReservation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingReservation) {
        await besiragaService.updateReservation(password, editingReservation.id, formData);
      } else {
        await besiragaService.createReservation(password, formData);
      }
      
      await fetchReservations();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) return;
    
    try {
      await besiragaService.deleteReservation(password, id);
      await fetchReservations();
    } catch (error) {
      alert(error.response?.data?.message || 'Silme işlemi başarısız');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('besiraga_password');
    navigate('/besiraga');
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f6f6]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ec1313]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f6f6] font-['Manrope']">
      {/* Header */}
      <header className="sticky top-0 bg-[#f8f6f6] z-10">
        <div className="flex items-center p-4 justify-between border-b border-[#ec1313]/20">
          <button onClick={() => navigate('/besiraga')} className="text-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="19" x2="5" y1="12" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 text-center">Yönetim Paneli</h1>
          <button onClick={handleLogout} className="text-[#ec1313]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 space-y-4">
        {/* Add Button */}
        <button
          onClick={() => handleOpenModal()}
          className="w-full bg-[#ec1313] hover:bg-[#c01010] text-white py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Rezervasyon Ekle
        </button>

        {/* Reservations Cards */}
        <div className="space-y-3">
          {reservations.length === 0 ? (
            <div className="text-center py-10 px-4 bg-[#ec1313]/5 rounded-lg">
              <p className="text-gray-600">Henüz rezervasyon bulunmuyor</p>
            </div>
          ) : (
            reservations.map((reservation) => {
              const roomInfo = ROOM_INFO[reservation.room_name];
              return (
                <div
                  key={reservation.id}
                  className="bg-white rounded-xl p-4 shadow-md border-2 border-[#ec1313]/20"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className="px-3 py-1 rounded-lg text-white text-xs font-bold"
                        style={{ backgroundColor: '#ec1313' }}
                      >
                        {roomInfo.name}
                      </span>
                      <span className="text-[#ec1313] text-xs font-semibold bg-red-50 px-2 py-1 rounded">
                        {reservation.capacity} kişi
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-1">
                        {reservation.group_name}
                      </h3>
                      {reservation.contact_person && (
                        <p className="text-sm text-gray-500 mb-2">
                          {reservation.contact_person}
                          {reservation.phone && ` • ${reservation.phone}`}
                        </p>
                      )}
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <svg className="w-4 h-4 text-[#ec1313]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDateTime(reservation.start_datetime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <svg className="w-4 h-4 text-[#ec1313]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDateTime(reservation.end_datetime)}</span>
                        </div>
                      </div>

                      {reservation.notes && (
                        <div className="mt-2 bg-red-50 rounded-lg p-2 border border-red-100">
                          <p className="text-gray-600 text-xs">{reservation.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenModal(reservation)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingReservation ? 'Rezervasyonu Düzenle' : 'Yeni Rezervasyon'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Room Select */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Oda *</label>
                <select
                  value={formData.room_name}
                  onChange={(e) => {
                    const room = e.target.value;
                    setFormData({
                      ...formData,
                      room_name: room,
                      capacity: ROOM_INFO[room].capacity
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1313] focus:border-[#ec1313]"
                  required
                >
                  {Object.entries(ROOM_INFO).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name} ({info.capacity} kişi)
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Grup Adı *</label>
                <input
                  type="text"
                  value={formData.group_name}
                  onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1313] focus:border-[#ec1313]"
                  placeholder="Örn: Ahmet Bey Düğünü"
                  required
                />
              </div>

              {/* Date Time */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Başlangıç *</label>
                  <input
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1313] focus:border-[#ec1313]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Bitiş *</label>
                  <input
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1313] focus:border-[#ec1313]"
                    required
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Kişi Sayısı *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1313] focus:border-[#ec1313]"
                  min="1"
                  max={ROOM_INFO[formData.room_name].capacity}
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">İletişim Kişisi</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1313] focus:border-[#ec1313]"
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1313] focus:border-[#ec1313]"
                    placeholder="0532 123 4567"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Notlar</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec1313] focus:border-[#ec1313]"
                  rows="3"
                  placeholder="Özel istekler, notlar..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#ec1313] hover:bg-[#c01010] text-white rounded-lg font-bold transition-colors"
                >
                  {editingReservation ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BesiragaPanel;