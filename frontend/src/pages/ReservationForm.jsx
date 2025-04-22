import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, addHours } from 'date-fns';
import { reservationService, vehicleService } from '../services/api';

const ReservationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedVehicleId = queryParams.get('vehicle');
  
  const isEditing = !!id;
  
  const [reservation, setReservation] = useState({
    vehicle_id: preSelectedVehicleId || '',
    start_date_time: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
    end_date_time: format(addHours(new Date(), 9), "yyyy-MM-dd'T'HH:mm"),
    purpose: '',
    notes: ''
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endHour, setEndHour] = useState('');

  
  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Tüm araçları getir
        const vehiclesData = await vehicleService.getAllVehicles();
        setVehicles(vehiclesData.filter(v => v.status === 'active'));
        
        // Düzenleme modunda ise rezervasyon bilgilerini getir
        if (isEditing) {
          const reservationData = await reservationService.getReservationById(id);
          
          // Tarih formatını düzelt
          setReservation({
            ...reservationData,
            start_date_time: format(new Date(reservationData.start_date_time), "yyyy-MM-dd'T'HH:mm"),
            end_date_time: format(new Date(reservationData.end_date_time), "yyyy-MM-dd'T'HH:mm")
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, [id, isEditing]);


  useEffect(() => {
    if (reservation.start_date_time) {
      const startDateTime = new Date(reservation.start_date_time);
      setStartDate(startDateTime.toISOString().split('T')[0]);
      setStartHour(startDateTime.getHours().toString().padStart(2, '0'));
    }
    
    if (reservation.end_date_time) {
      const endDateTime = new Date(reservation.end_date_time);
      setEndDate(endDateTime.toISOString().split('T')[0]);
      setEndHour(endDateTime.getHours().toString().padStart(2, '0'));
    }
  }, [reservation.start_date_time, reservation.end_date_time]);
  
  // Başlangıç tarihi değiştiğinde
  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    setStartDate(newDate);
    updateDateTime('start', newDate, startHour);
  };
  
  // Başlangıç saati değiştiğinde
  const handleStartHourChange = (e) => {
    const newHour = e.target.value;
    setStartHour(newHour);
    updateDateTime('start', startDate, newHour);
  };
  
  // Bitiş tarihi değiştiğinde
  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    setEndDate(newDate);
    updateDateTime('end', newDate, endHour);
  };
  
  // Bitiş saati değiştiğinde
  const handleEndHourChange = (e) => {
    const newHour = e.target.value;
    setEndHour(newHour);
    updateDateTime('end', endDate, newHour);
  };
  
  // Tarih ve saati birleştirip rezervasyon nesnesini güncelleme
  const updateDateTime = (prefix, date, hour) => {
    if (date && hour) {
      const newDateTime = `${date}T${hour}:00`;
      setReservation(prev => ({
        ...prev,
        [`${prefix}_date_time`]: newDateTime
      }));
    }
  };
  
  // Tarih değiştiğinde müsait araçları kontrol et
  useEffect(() => {
    const checkAvailability = async () => {
      if (!reservation.start_date_time || !reservation.end_date_time) return;
      
      try {
        setCheckingAvailability(true);
        const availableVehiclesData = await reservationService.getAvailableVehicles(
          reservation.start_date_time,
          reservation.end_date_time
        );
        
        // Düzenleme durumunda, mevcut seçili araç müsait değilse bile listede göster
        if (isEditing && reservation.vehicle_id) {
          const selectedVehicleExists = availableVehiclesData.some(v => v.id === parseInt(reservation.vehicle_id));
          
          if (!selectedVehicleExists) {
            const selectedVehicle = vehicles.find(v => v.id === parseInt(reservation.vehicle_id));
            if (selectedVehicle) {
              availableVehiclesData.push(selectedVehicle);
            }
          }
        }
        
        setAvailableVehicles(availableVehiclesData);
        setCheckingAvailability(false);
      } catch (err) {
        console.error('Müsait araçlar kontrol edilirken hata:', err);
        setCheckingAvailability(false);
      }
    };
    
    checkAvailability();
  }, [reservation.start_date_time, reservation.end_date_time, isEditing, reservation.vehicle_id, vehicles]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservation(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!reservation.vehicle_id || !reservation.start_date_time || !reservation.end_date_time || !reservation.purpose) {
      setError('Araç, başlangıç tarihi, bitiş tarihi ve amaç alanları zorunludur');
      return;
    }
    
    // Başlangıç tarihi bitiş tarihinden önce olmalı
    if (new Date(reservation.start_date_time) >= new Date(reservation.end_date_time)) {
      setError('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }
    
    // Başlangıç tarihi şu anki zamandan sonra olmalı
    if (new Date(reservation.start_date_time) <= new Date()) {
      setError('Başlangıç tarihi şu anki zamandan sonra olmalıdır');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      if (isEditing) {
        await reservationService.updateReservation(id, reservation);
      } else {
        await reservationService.createReservation(reservation);
      }
      
      navigate('/rezervation-succsess');
    } catch (err) {
      setError(err.response?.data?.message || 'Rezervasyon kaydedilirken bir hata oluştu');
      setSubmitting(false);
      console.error(err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Başlık Bölümü */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white rounded-full p-3 mr-4 shadow-lg">
              <svg className="h-7 w-7 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">
                {isEditing ? 'Talebi Düzenle' : 'Yeni Talep Oluştur'}
              </h1>
              <p className="text-red-300 mt-1">
                {isEditing ? 'Mevcut talebi güncelleyin' : 'Yeni araç talebi oluşturun'}
              </p>
            </div>
          </div>
          <div>
            <button
              type="button"
              className="transition duration-300 ease-in-out transform hover:scale-105 bg-white text-black font-medium rounded-lg px-4 py-2 flex items-center shadow-md"
              onClick={() => navigate('/reservations')}
            >
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Taleplere Dön
            </button>
          </div>
        </div>
      </div>
      
      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 shadow-md transform transition-all duration-300 hover:scale-105">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Form Bölümü */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition duration-300 hover:shadow-2xl">
  <div className="px-6 py-5 bg-gradient-to-r from-primary-600 to-primary-800 border-b border-primary-700">
    <h2 className="text-xl font-bold text-white flex items-center">
      <svg className="h-6 w-6 mr-2 text-primary-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Talep Bilgileri
    </h2>
  </div>
  
  <form onSubmit={handleSubmit} className="p-8">
    <div className="space-y-8">
     
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Başlangıç Tarihi ve Saati */}
  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm transform transition-all duration-300 hover:shadow-md">
    <label htmlFor="start_date" className="block text-lg font-semibold text-gray-800 mb-3">
      <div className="flex items-center">
        <div className="p-2 bg-primary-100 rounded-lg mr-3">
          <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span>Başlangıç Tarihi</span>
        <span className="ml-2 text-red-600 text-lg">*</span>
      </div>
    </label>
    <input
      type="date"
      name="start_date"
      id="start_date"
      required
      className="block w-full px-4 py-3 text-base border-2 border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-xl shadow-sm transition-all duration-300 bg-white mb-3"
      value={startDate}
      onChange={handleStartDateChange}
    />
    
    <label htmlFor="start_hour" className="block text-sm font-medium text-gray-700 mb-1">
      Başlangıç Saati <span className="text-red-600">*</span>
    </label>
    <select
      name="start_hour"
      id="start_hour"
      required
      className="block w-full px-4 py-3 text-base border-2 border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-xl shadow-sm transition-all duration-300 bg-white"
      value={startHour}
      onChange={handleStartHourChange}
    >
      <option value="">Saat Seçin</option>
      <option value="01">01:00</option>
      <option value="02">02:00</option>
      <option value="03">03:00</option>
      <option value="04">04:00</option>
      <option value="05">05:00</option>
      <option value="06">06:00</option>
      <option value="07">07:00</option>
      <option value="08">08:00</option>
      <option value="09">09:00</option>
      <option value="10">10:00</option>
      <option value="11">11:00</option>
      <option value="12">12:00</option>
      <option value="13">13:00</option>
      <option value="14">14:00</option>
      <option value="15">15:00</option>
      <option value="16">16:00</option>
      <option value="17">17:00</option>
      <option value="18">18:00</option>
      <option value="18">19:00</option>
      <option value="18">20:00</option>
      <option value="18">21:00</option>
      <option value="18">22:00</option>
      <option value="18">23:00</option>
      <option value="18">24:00</option>
      <option value="18">00:00</option>
    </select>
  </div>
  
  {/* Bitiş Tarihi ve Saati */}
  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm transform transition-all duration-300 hover:shadow-md">
    <label htmlFor="end_date" className="block text-lg font-semibold text-gray-800 mb-3">
      <div className="flex items-center">
        <div className="p-2 bg-primary-100 rounded-lg mr-3">
          <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>Teslim Tarihi</span>
        <span className="ml-2 text-red-600 text-lg">*</span>
      </div>
    </label>
    <input
      type="date"
      name="end_date"
      id="end_date"
      required
      className="block w-full px-4 py-3 text-base border-2 border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-xl shadow-sm transition-all duration-300 bg-white mb-3"
      value={endDate}
      onChange={handleEndDateChange}
    />
    
    <label htmlFor="end_hour" className="block text-sm font-medium text-gray-700 mb-1">
      Teslim Saati <span className="text-red-600">*</span>
    </label>
    <select
      name="end_hour"
      id="end_hour"
      required
      className="block w-full px-4 py-3 text-base border-2 border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-xl shadow-sm transition-all duration-300 bg-white"
      value={endHour}
      onChange={handleEndHourChange}
    >
      <option value="">Saat Seçin</option>
      <option value="01">01:00</option>
      <option value="02">02:00</option>
      <option value="03">03:00</option>
      <option value="04">04:00</option>
      <option value="05">05:00</option>
      <option value="06">06:00</option>
      <option value="07">07:00</option>
      <option value="08">08:00</option>
      <option value="09">09:00</option>
      <option value="10">10:00</option>
      <option value="11">11:00</option>
      <option value="12">12:00</option>
      <option value="13">13:00</option>
      <option value="14">14:00</option>
      <option value="15">15:00</option>
      <option value="16">16:00</option>
      <option value="17">17:00</option>
      <option value="18">18:00</option>
      <option value="18">19:00</option>
      <option value="18">20:00</option>
      <option value="18">21:00</option>
      <option value="18">22:00</option>
      <option value="18">23:00</option>
      <option value="18">24:00</option>
      <option value="18">00:00</option>
    </select>
  </div>
</div>


<div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm transform transition-all duration-300 hover:shadow-md">
        <label htmlFor="vehicle_id" className="block text-lg font-semibold text-gray-800 mb-3">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <span>Araç Seçimi</span>
            <span className="ml-2 text-red-600 text-lg">*</span>
          </div>
        </label>
        <div className="relative mt-2">
          <select
            id="vehicle_id"
            name="vehicle_id"
            required
            className="block w-full pl-6 pr-10 py-3 text-base border-2 border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-xl shadow-sm transition-all duration-300 bg-white"
            value={reservation.vehicle_id}
            onChange={handleChange}
            disabled={checkingAvailability}
          >
            <option value="">Araç Seçin</option>
            {availableVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} ({vehicle.license_plate})
              </option>
            ))}
          </select>
        </div>
        {checkingAvailability && (
          <div className="flex items-center mt-3 text-sm text-primary-700 bg-primary-50 p-3 rounded-lg">
            <svg className="animate-spin h-5 w-5 mr-3 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-medium">Müsait araçlar kontrol ediliyor...</p>
          </div>
        )}
        {!checkingAvailability && availableVehicles.length === 0 && (
          <div className="flex items-center mt-3 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
            <svg className="h-5 w-5 mr-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">Seçilen tarih aralığında müsait araç bulunmamaktadır.</p>
          </div>
        )}
      </div>
      
      {/* Amaç */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm transform transition-all duration-300 hover:shadow-md">
        <label htmlFor="purpose" className="block text-lg font-semibold text-gray-800 mb-3">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span>Talebin Amacı</span>
            <span className="ml-2 text-red-600 text-lg">*</span>
          </div>
        </label>
        <input
          type="text"
          name="purpose"
          id="purpose"
          required
          className="block w-full px-4 py-3 text-base border-2 border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-xl shadow-sm transition-all duration-300 bg-white"
          value={reservation.purpose}
          onChange={handleChange}
          placeholder="Müşteri ziyareti, toplantı, vb."
        />
      </div>
      
      {/* Notlar */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm transform transition-all duration-300 hover:shadow-md">
        <label htmlFor="notes" className="block text-lg font-semibold text-gray-800 mb-3">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span>Ek Notlar</span>
          </div>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="4"
          className="block w-full px-4 py-3 text-base border-2 border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded-xl shadow-sm transition-all duration-300 bg-white"
          value={reservation.notes || ''}
          onChange={handleChange}
          placeholder="Ek bilgiler, özel istekler..."
        ></textarea>
      </div>
    </div>
    
    {/* Bilgilendirme Kutusu */}
    <div className="mt-8 bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-xl p-4 shadow-inner">
      <div className="flex">
        <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
          <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-4">
          <h4 className="text-sm font-bold text-blue-800">Bilgilendirme</h4>
          <p className="mt-1 text-sm text-blue-700">
            Talep oluşturulduktan sonra yönetici onayı gerekecektir. Onaylanmadan önce talebinizi iptal edebilir veya düzenleyebilirsiniz.
          </p>
        </div>
      </div>
    </div>
    
    {/* Butonlar */}
    <div className="mt-8 flex justify-end space-x-4">
      <button
        type="button"
        className="px-6 py-3 border-2 border-gray-300 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:-translate-y-1 shadow-sm"
        onClick={() => navigate('/reservations')}
      >
        <div className="flex items-center">
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          İptal
        </div>
      </button>
      <button
        type="submit"
        className="px-6 py-3 border-2 border-primary-600 rounded-xl text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 hover:border-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        disabled={submitting || availableVehicles.length === 0}
      >
        {submitting ? (
          <div className="flex items-center">
            <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Kaydediliyor...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className='text-black'>Kaydet</span>
          </div>
        )}
      </button>
    </div>
  </form>
</div>
    </div>
  );
};

export default ReservationForm;