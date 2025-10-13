import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8060/api';
const BESIRAGA_API_URL = `${API_URL}/besiraga`;

export const besiragaService = {

  // ===================================================================
  //                            PUBLIC ALAN
  //       Bu fonksiyonlar için admin şifresi gerekmez.
  // ===================================================================

  /**
   * Kullanıcının rezervasyon talep formunu gönderir.
   * @param {object} requestData Kullanıcının girdiği form verileri
   * @returns {Promise<object>} API'den dönen cevap
   */
  createRequest: async (requestData) => {
    const response = await axios.post(`${BESIRAGA_API_URL}/requests`, requestData);
    return response.data;
  },

  /**
   * ✨ YENİ: Belirli bir saat aralığında kontenjan kontrolü yapar
   * @param {string} start_datetime Başlangıç zamanı (ISO format)
   * @param {string} end_datetime Bitiş zamanı (ISO format)
   * @param {number} participant_count Katılımcı sayısı
   * @returns {Promise<object>} Kontenjan durumu
   */
  checkAvailability: async (start_datetime, end_datetime, participant_count) => {
    const response = await axios.post(`${BESIRAGA_API_URL}/check-availability`, {
      start_datetime,
      end_datetime,
      participant_count
    });
    return response.data;
  },

  /**
   * Genel takvimde gösterilecek, SADECE ONAYLANMIŞ rezervasyonları getirir.
   * @returns {Promise<object>} Onaylanmış rezervasyonların listesi
   */
  getPublicReservations: async () => {
    const response = await axios.get(`${BESIRAGA_API_URL}/public-reservations`);
    return response.data;
  },


  // ===================================================================
  //                             ADMIN ALANI
  //         Bu fonksiyonlar için admin şifresi gereklidir.
  // ===================================================================

  /**
   * Admin paneli için tüm rezervasyon taleplerini getirir.
   * Duruma göre filtreleme yapılabilir ('pending', 'approved', 'rejected').
   * @param {string} password Admin şifresi
   * @param {string} [status] Filtrelenecek durum (isteğe bağlı)
   * @returns {Promise<object>} Rezervasyon taleplerinin listesi
   */
  getAllRequests: async (password, status) => {
    const config = {
      headers: { 'X-Admin-Password': password },
      params: { status }
    };
    const response = await axios.get(`${BESIRAGA_API_URL}/admin/requests`, config);
    return response.data;
  },

  /**
   * Bir rezervasyon talebinin detaylarını (tarih, kişi, notlar vb.) günceller.
   * @param {string} password Admin şifresi
   * @param {number} id Güncellenecek talebin ID'si
   * @param {object} requestData Güncel talep verileri
   * @returns {Promise<object>} API'den dönen cevap
   */
  updateRequestDetails: async (password, id, requestData) => {
    const response = await axios.put(
      `${BESIRAGA_API_URL}/admin/requests/${id}`,
      { ...requestData, password }
    );
    return response.data;
  },

  /**
   * Bir talebin durumunu günceller (onaylar veya reddeder).
   * @param {string} password Admin şifresi
   * @param {number} id İşlem yapılacak talebin ID'si
   * @param {'approved' | 'rejected' | 'pending'} status Yeni durum
   * @param {string} [admin_notes] Adminin eklemek istediği not (isteğe bağlı)
   * @returns {Promise<object>} API'den dönen cevap
   */
  updateRequestStatus: async (password, id, status, admin_notes = '') => {
    const response = await axios.patch(
      `${BESIRAGA_API_URL}/admin/requests/${id}/status`,
      { status, admin_notes, password }
    );
    return response.data;
  },

  /**
   * Bir rezervasyon talebini kalıcı olarak siler.
   * @param {string} password Admin şifresi
   * @param {number} id Silinecek talebin ID'si
   * @returns {Promise<object>} API'den dönen cevap
   */
  deleteRequest: async (password, id) => {
    const response = await axios.delete(
      `${BESIRAGA_API_URL}/admin/requests/${id}`,
      { data: { password } }
    );
    return response.data;
  },

  /**
   * ✨ YENİ: Admin için belirli bir tarihteki kontenjan özetini getirir
   * @param {string} password Admin şifresi
   * @param {string} date Tarih (YYYY-MM-DD formatında)
   * @returns {Promise<object>} Kontenjan özeti
   */
  getCapacitySummary: async (password, date) => {
    const config = {
      headers: { 'X-Admin-Password': password },
      params: { date }
    };
    const response = await axios.get(`${BESIRAGA_API_URL}/admin/capacity-summary`, config);
    return response.data;
  },
};

// Oda bilgileri (Artık tüm Beşirağa tek oda gibi çalışacak)
export const ROOM_INFO = {
  None: { 
    name: 'Beşirağa Medresesi', 
    capacity: 100, 
    color: '#dc2626',
    image: '/images/besiraga/yemekhane.jpg'
  },
  Yemekhane: { 
    name: 'Yemekhane', 
    capacity: 40, 
    color: '#dc2626',
    image: '/images/besiraga/yemekhane.jpg'
  },
  Atolye: { 
    name: 'Atölye', 
    capacity: 30, 
    color: '#ea580c',
    image: '/images/besiraga/atolye.jpg'
  },
  Cardaklar: { 
    name: 'Çardaklar', 
    capacity: 30, 
    color: '#f59e0b',
    image: '/images/besiraga/cardaklar.jpg'
  },
  Medrese_Sedir: { 
    name: 'Medrese Sedirli Oda', 
    capacity: 15, 
    color: '#ec4899',
    image: '/images/besiraga/medrese-sedir.jpg'
  },
  Cami_Sedir: { 
    name: 'Cami Yanı Sedirli Oda', 
    capacity: 40, 
    color: '#ef4444',
    image: '/images/besiraga/cami-sedir.jpg'
  },
};

export default besiragaService;