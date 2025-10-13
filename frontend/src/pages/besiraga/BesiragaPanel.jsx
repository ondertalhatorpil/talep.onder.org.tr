import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { besiragaService, ROOM_INFO } from '../../services/besiragaApi';

const STATUS_STYLES = {
  pending: { text: 'Onay Bekliyor', bg: 'bg-yellow-50', text_color: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' },
  approved: { text: 'Onaylandı', bg: 'bg-green-50', text_color: 'text-green-700', badge: 'bg-green-100 text-green-800' },
  rejected: { text: 'Reddedildi', bg: 'bg-red-50', text_color: 'text-red-700', badge: 'bg-red-100 text-red-800' },
};

const initialFormData = {
  room_name: 'None',
  organization_name: '',
  event_date: '',
  start_time: '',
  end_time: '',
  participant_count: 1,
  contact_name: '',
  contact_phone: '',
  user_notes: '',
  admin_notes: ''
};

const BesiragaPanel = () => {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const navigate = useNavigate();
  const password = sessionStorage.getItem('besiraga_password');

  useEffect(() => {
    if (!password) {
      navigate('/besiraga/admin');
      return;
    }
    fetchRequests();
  }, [password, navigate, filterStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await besiragaService.getAllRequests(password, filterStatus);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Talepleri yüklerken hata:', error);
      if (error.response?.status === 401) {
          alert('Şifre yanlış veya geçersiz. Lütfen tekrar giriş yapın.');
          handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (request = null) => {
    if (request) {
      setEditingRequest(request);
      
      const startDate = request.start_datetime ? new Date(request.start_datetime) : null;
      const endDate = request.end_datetime ? new Date(request.end_datetime) : null;
      
      setFormData({
        room_name: request.room_name || 'None',
        organization_name: request.organization_name,
        event_date: startDate ? startDate.toISOString().split('T')[0] : '',
        start_time: startDate ? startDate.toTimeString().slice(0, 5) : '',
        end_time: endDate ? endDate.toTimeString().slice(0, 5) : '',
        participant_count: request.participant_count,
        contact_name: request.contact_name,
        contact_phone: request.contact_phone,
        user_notes: request.user_notes || '',
        admin_notes: request.admin_notes || ''
      });
    } else {
      setEditingRequest(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRequest(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      start_datetime: `${formData.event_date}T${formData.start_time}`,
      end_datetime: `${formData.event_date}T${formData.end_time}`,
    };
    delete payload.event_date;
    delete payload.start_time;
    delete payload.end_time;

    try {
      if (editingRequest) {
        await besiragaService.updateRequestDetails(password, editingRequest.id, payload);
      } else {
        await besiragaService.createRequest(payload);
      }
      await fetchRequests();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'İşlem başarısız');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Bu talebi ONAYLAMAK istediğinize emin misiniz?')) return;
    try {
      await besiragaService.updateRequestStatus(password, id, 'approved');
      await fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Onaylama işlemi başarısız');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Bu talebi REDDETMEK istediğinize emin misiniz?')) return;
    try {
      await besiragaService.updateRequestStatus(password, id, 'rejected');
      await fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Reddetme işlemi başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu talebi kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      await besiragaService.deleteRequest(password, id);
      await fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Silme işlemi başarısız');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('besiraga_password');
    navigate('/besiraga');
  };

  const formatDate = (datetime) => {
    if (!datetime) return '-';
    const date = new Date(datetime);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (datetime) => {
    if (!datetime) return '-';
    const date = new Date(datetime);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredRequests = requests.filter(req => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchSearch = (
        req.organization_name?.toLowerCase().includes(search) ||
        req.contact_name?.toLowerCase().includes(search) ||
        req.contact_phone?.includes(search)
      );
      if (!matchSearch) return false;
    }

    if (filterDate) {
      const reqDate = req.start_datetime ? new Date(req.start_datetime).toISOString().split('T')[0] : null;
      if (reqDate !== filterDate) return false;
    }

    return true;
  });
  
  if (loading) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    ); 
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/besiraga')} className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Beşirağa Rezervasyon Yönetimi</h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleOpenModal()} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Yeni Talep
              </button>
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <h2 className="font-bold text-gray-900">Filtreler</h2>
            <button onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterStatus('pending'); }} className="ml-auto text-sm text-gray-600 hover:text-gray-900">✕ Temizle</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ara</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Organizasyon, kişi adı veya telefon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Onay Bekliyor</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NO</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Organizasyon</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İletişim</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Telefon</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Saat</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kişi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                      Gösterilecek talep bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const statusStyle = STATUS_STYLES[request.status];
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">#{request.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{request.organization_name || '-'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.contact_name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <a href={`tel:${request.contact_phone}`} className="text-sm text-blue-600 hover:underline">
                            {request.contact_phone}
                          </a>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {formatDate(request.start_datetime)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTime(request.start_datetime)} - {formatTime(request.end_datetime)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {request.participant_count} kişi
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.badge}`}>
                            {statusStyle.text}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleOpenModal(request)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Detay"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Toplam <span className="font-semibold">{filteredRequests.length}</span> kayıt gösteriliyor
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">{editingRequest ? 'Talebi Düzenle' : 'Yeni Talep Oluştur'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organizasyon Adı *</label>
                      <input type="text" name="organization_name" value={formData.organization_name} onChange={(e) => setFormData({...formData, organization_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Katılımcı Sayısı *</label>
                      <input type="number" name="participant_count" min="1" max="100" value={formData.participant_count} onChange={(e) => setFormData({...formData, participant_count: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Etkinlik Tarihi *</label>
                    <input type="date" name="event_date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Saati *</label>
                    <input type="time" name="start_time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Saati *</label>
                    <input type="time" name="end_time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">İletişim Kişisi *</label>
                      <input type="text" name="contact_name" value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                      <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required/>
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Notu</label>
                  <textarea name="user_notes" value={formData.user_notes} onChange={(e) => setFormData({...formData, user_notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notu</label>
                  <textarea name="admin_notes" value={formData.admin_notes} onChange={(e) => setFormData({...formData, admin_notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="2" placeholder="Sadece admin görebilir" />
                </div>

                {editingRequest && (
                  <div className="flex gap-3 pt-4 border-t">
                    {editingRequest.status === 'pending' && (
                      <>
                        <button type="button" onClick={() => handleApprove(editingRequest.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold">Onayla</button>
                        <button type="button" onClick={() => handleReject(editingRequest.id)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-semibold">Reddet</button>
                      </>
                    )}
                    <button type="button" onClick={() => handleDelete(editingRequest.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold">Sil</button>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={handleCloseModal} className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50">İptal</button>
                    <button type="submit" className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">{editingRequest ? 'Güncelle' : 'Oluştur'}</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BesiragaPanel;