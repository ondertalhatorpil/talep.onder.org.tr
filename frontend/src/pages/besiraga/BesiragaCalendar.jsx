import { useState, useEffect } from 'react';
import { besiragaService, ROOM_INFO } from '../../services/besiragaApi';
import '../../assets/style/besiraga.css';

const TIME_SLOTS = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
  '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
  '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
  '20:00 - 21:00', '21:00 - 22:00'
];

const initialFormState = {
  event_date: '',
  time_slot: TIME_SLOTS[0],
  participant_count: 1,
  organization_name: '',
  contact_name: '',
  contact_phone: '',
  user_notes: '',
};

const BrandLogo = () => (
    <img src="https://onder.org.tr/assets/images/statics/onder-logo.svg" alt="ÖNDER İmam Hatipliler Derneği" className="h-12 w-auto" />
);

const FloatingLabelInput = ({ label, name, type, value, onChange, required = false }) => {
    return (
        <div className="relative">
            <input
                id={name} name={name} type={type} value={value} onChange={onChange}
                className="block px-3 py-3 w-full text-sm text-slate-900 bg-slate-50/70 rounded-md border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-red-800 peer transition-colors"
                placeholder=" " required={required}
            />
            <label
                htmlFor={name}
                className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-slate-50/0 rounded-md px-2 peer-focus:px-2 peer-focus:text-red-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
            >
                {label}
            </label>
        </div>
    );
};

const BesiragaRequestPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  
  // ✨ YENİ: Kontenjan kontrol state'leri
  const [capacityInfo, setCapacityInfo] = useState(null);
  const [isCheckingCapacity, setIsCheckingCapacity] = useState(false);
  const [capacityError, setCapacityError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✨ YENİ: Kontenjan kontrolü fonksiyonu
  const checkCapacity = async () => {
    const { event_date, time_slot, participant_count } = formData;
    
    // Gerekli alanlar doluysa kontrol et
    if (!event_date || !time_slot || !participant_count || participant_count < 1) {
      setCapacityInfo(null);
      setCapacityError('');
      return;
    }

    const [startTime, endTime] = time_slot.split(' - ');
    const start_datetime = `${event_date}T${startTime}`;
    const end_datetime = `${event_date}T${endTime}`;

    setIsCheckingCapacity(true);
    setCapacityError('');

    try {
      const response = await besiragaService.checkAvailability(
        start_datetime,
        end_datetime,
        parseInt(participant_count)
      );

      if (response.success) {
        setCapacityInfo(response.data);
        if (!response.data.is_available) {
          setCapacityError(response.data.message);
        }
      }
    } catch (error) {
      console.error('Kontenjan kontrolü hatası:', error);
      setCapacityError('Kontenjan kontrolü yapılamadı.');
    } finally {
      setIsCheckingCapacity(false);
    }
  };

  // ✨ YENİ: Form değiştiğinde otomatik kontenjan kontrolü
  useEffect(() => {
    const timer = setTimeout(() => {
      checkCapacity();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [formData.event_date, formData.time_slot, formData.participant_count]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kontenjan kontrolü - submit öncesi final kontrol
    if (capacityInfo && !capacityInfo.is_available) {
      setSubmitStatus({ 
        message: `Kontenjan yetersiz! Bu saat dilimi için sadece ${capacityInfo.remaining_capacity} kişilik yer kaldı.`, 
        type: 'error' 
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ message: '', type: '' });
    
    const [startTime, endTime] = formData.time_slot.split(' - ');
    if (!formData.event_date || !startTime || !endTime) {
      setSubmitStatus({ message: 'Lütfen tüm tarih ve saat alanlarını doldurun.', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    const payload = { 
      ...formData, 
      room_name: 'Beşirağa Medresesi', 
      start_datetime: `${formData.event_date}T${startTime}`, 
      end_datetime: `${formData.event_date}T${endTime}`
    };
    delete payload.event_date;
    delete payload.time_slot;

    try {
      const response = await besiragaService.createRequest(payload);
      setSubmitStatus({ 
        message: response.message || 'Talebiniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.', 
        type: 'success' 
      });
      setFormData(initialFormState);
      setCapacityInfo(null);
    } catch (error) {
      setSubmitStatus({ 
        message: error.response?.data?.message || 'Talebiniz gönderilirken bir hata oluştu.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Manrope'] antialiased">
      <div className="lg:grid lg:grid-cols-12 lg:min-h-screen">
        
        {/* SOL TARAF: KURUMSAL GÖRSEL PANELİ */}
        <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:items-center lg:justify-center p-12 text-white relative">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/fe/40/a2/haci-besir-aga-camii.jpg?w=1200&h=1200&s=1')"}}></div>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
            <div className="relative text-center z-10 flex flex-col items-center">
                <BrandLogo />
                <h1 className="text-4xl font-bold tracking-tight mt-6">Beşirağa Medresesi</h1>
                <p className="mt-4 max-w-md text-lg text-slate-300 leading-relaxed">
                    Tarihin ve maneviyatın buluştuğu bu özel mekanda etkinliğinizi gerçekleştirmek için müsaitlik durumunu kontrol edin ve talebinizi bize iletin.
                </p>
                <button
                    onClick={() => setShowInfoDrawer(true)}
                    className="mt-10 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-500 bg-black/20 px-6 py-3 font-semibold text-white transition-all hover:bg-black/40 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm4 3h8m-8 4h8m-8 4h4" /></svg>
                    Mekan Görsellerini İnceleyin
                </button>
            </div>
        </div>

        {/* SAĞ TARAF: REZERVASYON FORMU */}
        <main className="w-full lg:col-span-7 px-4 py-8 sm:p-8 md:p-12 flex items-center justify-center bg-white">
          <div className="w-full max-w-lg">
            <header className="text-center lg:text-left mb-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Beşirağa Müsait mi ?</h2>
            </header>
            
            <div className="mb-6 lg:hidden">
              <button
                onClick={() => setShowInfoDrawer(true)}
                className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 text-sm"
              >
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                  Mekan Görsellerini ve Bilgilerini İnceleyin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ✨ 1. ÖNCE KATILIMCI SAYISI */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Kaç Kişi Geleceksiniz? *</label>
                    <input 
                      type="number" 
                      name="participant_count" 
                      min="1"
                      max="100"
                      value={formData.participant_count} 
                      onChange={handleInputChange}
                      className="block w-full text-slate-900 bg-slate-50/70 rounded-md border-2 border-slate-200 focus:outline-none focus:ring-0 focus:border-red-800 transition-colors p-2.5"
                      placeholder="Örn: 25"
                      required
                    />
                    <p className="mt-1.5 text-xs text-slate-500">Maksimum 100 kişi kapasitemiz bulunmaktadır.</p>
                </div>

                {/* ✨ 2. SONRA TARİH VE SAAT (Sadece katılımcı sayısı girilince görünür) */}
                {formData.participant_count && parseInt(formData.participant_count) > 0 && (
                  <>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Etkinlik Tarihi *</label>
                            <input 
                              type="date" 
                              name="event_date" 
                              value={formData.event_date} 
                              onChange={handleInputChange} 
                              min={new Date().toISOString().split('T')[0]}
                              className="block w-full text-slate-900 bg-slate-50/70 rounded-md border-2 border-slate-200 focus:outline-none focus:ring-0 focus:border-red-800 transition-colors p-2.5" 
                              required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Saat Aralığı *</label>
                            <select 
                              name="time_slot" 
                              value={formData.time_slot} 
                              onChange={handleInputChange} 
                              className="block w-full text-slate-900 bg-slate-50/70 rounded-md border-2 border-slate-200 focus:outline-none focus:ring-0 focus:border-red-800 transition-colors p-2.5" 
                              required
                            >
                              {TIME_SLOTS.map(slot => (<option key={slot} value={slot}>{slot}</option>))}
                            </select>
                        </div>
                    </div>

                    {/* ✨ 3. MİNİMAL KONTENJAN DURUMU - Sadece dolu ise göster */}
                    {formData.event_date && formData.time_slot && capacityInfo && !capacityInfo.is_available && !isCheckingCapacity && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{capacityInfo.message}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Diğer Form Alanları */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FloatingLabelInput 
                      label="Kurum / Organizasyon Adı" 
                      name="organization_name" 
                      type="text" 
                      value={formData.organization_name} 
                      onChange={handleInputChange} 
                    />
                    <FloatingLabelInput 
                      label="Adınız Soyadınız *" 
                      name="contact_name" 
                      type="text" 
                      value={formData.contact_name} 
                      onChange={handleInputChange} 
                      required 
                    />
                </div>
                
                <div>
                    <FloatingLabelInput 
                      label="Telefon Numaranız *" 
                      name="contact_phone" 
                      type="tel" 
                      value={formData.contact_phone} 
                      onChange={handleInputChange} 
                      required 
                    />
                </div>
                
                <div className="relative">
                     <textarea 
                       id="user_notes" 
                       name="user_notes" 
                       rows="4" 
                       value={formData.user_notes} 
                       onChange={handleInputChange} 
                       className="block px-3 py-3 w-full text-sm text-slate-900 bg-slate-50/70 rounded-md border-2 border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-red-800 peer transition-colors" 
                       placeholder=" "
                     ></textarea>
                     <label 
                       htmlFor="user_notes" 
                       className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white rounded-md px-2 peer-focus:px-2 peer-focus:text-red-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                     >
                       Ek Notlarınız
                     </label>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || (capacityInfo && !capacityInfo.is_available)} 
                    className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white py-3.5 px-6 rounded-lg font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-800/30 hover:shadow-xl hover:shadow-red-800/40 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none text-base focus:outline-none focus:ring-4 focus:ring-red-800/50"
                  >
                    {isSubmitting ? 'Talebiniz Gönderiliyor...' : 
                     (capacityInfo && !capacityInfo.is_available) ? 'Kontenjan Dolu - Talep Oluşturulamaz' :
                     'Rezervasyon Talebini Gönder'}
                  </button>
                </div>

                {submitStatus.message && (
                  <div className={`p-4 mt-4 rounded-lg flex items-start gap-3 text-sm font-semibold ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {submitStatus.type === 'success' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    }
                    <span>{submitStatus.message}</span>
                  </div>
                )}
            </form>
          </div>
        </main>
      </div>
      
      {/* Drawer/Modal */}
      {showInfoDrawer && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={() => setShowInfoDrawer(false)}/>
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
            <div className="bg-white rounded-t-3xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex justify-center pt-3 pb-2 flex-shrink-0"><div className="w-12 h-1.5 bg-slate-300 rounded-full"></div></div>
              <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex-shrink-0 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Mekan Görselleri ve Bilgileri</h2>
                  <button onClick={() => setShowInfoDrawer(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6">
                  {Object.entries(ROOM_INFO).map(([key, info]) => (
                    <div key={key} className="group overflow-hidden rounded-xl bg-white border border-slate-200/80 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                       <div className="relative h-64 overflow-hidden">
                         <img src={info.image || 'https://via.placeholder.com/400x300'} alt={info.name} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"/>
                       </div>
                       <div className="p-4">
                           <h3 className="text-lg font-bold text-slate-800">{info.name}</h3>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BesiragaRequestPage;