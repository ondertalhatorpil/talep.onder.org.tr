import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, addHours } from 'date-fns';
import { reservationService, vehicleService } from '../services/api';
import { 
  ArrowLeft, 
  Send, 
  Calendar, 
  Clock, 
  Car, 
  FileEdit, 
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const vehiclesData = await vehicleService.getAllVehicles();
        setVehicles(vehiclesData.filter(v => v.status === 'active'));
        if (isEditing) {
          const data = await reservationService.getReservationById(id);
          setReservation({
            ...data,
            start_date_time: format(new Date(data.start_date_time), "yyyy-MM-dd'T'HH:mm"),
            end_date_time: format(new Date(data.end_date_time), "yyyy-MM-dd'T'HH:mm")
          });
        }
        setLoading(false);
      } catch (err) { 
        setError('Veriler yüklenirken bir hata oluştu');
        setLoading(false); 
      }
    };
    fetchData();
  }, [id, isEditing]);

  useEffect(() => {
    if (reservation.start_date_time) {
      const [d, t] = reservation.start_date_time.split('T');
      setStartDate(d); 
      setStartHour(t.substring(0, 2));
    }
    if (reservation.end_date_time) {
      const [d, t] = reservation.end_date_time.split('T');
      setEndDate(d); 
      setEndHour(t.substring(0, 2));
    }
  }, [reservation.start_date_time, reservation.end_date_time]);

  const updateDateTime = (prefix, date, hour) => {
    if (date && hour) {
      const newDateTime = `${date}T${hour}:00`;
      setReservation(prev => ({ ...prev, [`${prefix}_date_time`]: newDateTime }));
    }
  };

  useEffect(() => {
    const check = async () => {
      if (!reservation.start_date_time || !reservation.end_date_time) return;
      try {
        setCheckingAvailability(true);
        const data = await reservationService.getAvailableVehicles(
          reservation.start_date_time, 
          reservation.end_date_time
        );
        setAvailableVehicles(data);
        setCheckingAvailability(false);
      } catch (err) { 
        setCheckingAvailability(false); 
      }
    };
    check();
  }, [reservation.start_date_time, reservation.end_date_time]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!reservation.vehicle_id || !reservation.purpose) {
      setError('Lütfen tüm zorunlu alanları doldurunuz');
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
      setError(err.response?.data?.message || 'Kaydedilirken bir hata oluştu');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yükleniyor</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2 md:py-8 px-1 animate-fadeIn pb-2">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-6 md:mb-10">
        <button 
          onClick={() => navigate('/reservations')}
          className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors group"
        >
          <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Vazgeç
        </button>
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
          {isEditing ? 'Talebi' : 'Yeni Araç'} <span className="text-red-600">{isEditing ? 'Güncelle' : 'Talebi'}</span>
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center text-red-600 mb-6 animate-shake">
          <AlertCircle size={18} className="mr-3 shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 p-6 md:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-6 md:space-y-8">
          
          {/* Talep Amacı */}
          <div className="space-y-2">
            <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
              <FileEdit size={12} className="mr-2 text-red-500" /> Talep Amacı
            </label>
            <input
              type="text"
              required
              placeholder="Gidiş amacını belirtiniz..."
              className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
              value={reservation.purpose}
              onChange={(e) => setReservation({...reservation, purpose: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Başlangıç Tarihi */}
            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                <Calendar size={12} className="mr-2 text-red-500" /> Alış Tarihi & Saat
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-4 py-3.5 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-700"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    updateDateTime('start', e.target.value, startHour);
                  }}
                />
                <select
                  className="w-20 md:w-24 px-2 py-3.5 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-700 appearance-none text-center"
                  value={startHour}
                  onChange={(e) => {
                    setStartHour(e.target.value);
                    updateDateTime('start', startDate, e.target.value);
                  }}
                >
                  {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teslim Tarihi */}
            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                <Clock size={12} className="mr-2 text-red-500" /> Teslim Tarihi & Saat
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-4 py-3.5 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-700"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    updateDateTime('end', e.target.value, endHour);
                  }}
                />
                <select
                  className="w-20 md:w-24 px-2 py-3.5 bg-gray-50 border-none rounded-xl md:rounded-2xl focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-700 appearance-none text-center"
                  value={endHour}
                  onChange={(e) => {
                    setEndHour(e.target.value);
                    updateDateTime('end', endDate, e.target.value);
                  }}
                >
                  {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => (
                    <option key={h} value={h}>{h}:00</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Araç Seçimi */}
          <div className="space-y-3">
            <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
              <Car size={12} className="mr-2 text-red-500" /> Araç Seçimi
            </label>
            <div className="relative">
              <select
                required
                disabled={checkingAvailability}
                className="w-full px-5 py-4 bg-gray-900 text-white border-none rounded-2xl md:rounded-[1.5rem] focus:ring-4 focus:ring-red-500/10 transition-all text-[11px] md:text-sm font-black uppercase tracking-widest disabled:opacity-50 appearance-none cursor-pointer"
                value={reservation.vehicle_id}
                onChange={(e) => setReservation({...reservation, vehicle_id: e.target.value})}
              >
                <option value="">{checkingAvailability ? 'Kontrol...' : '--- Seçiniz ---'}</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} | {v.license_plate}
                  </option>
                ))}
              </select>
              {!checkingAvailability && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Geri Bildirim */}
            {!checkingAvailability && (
              <div className="px-1">
                {availableVehicles.length === 0 ? (
                  <p className="text-[9px] text-red-500 font-black uppercase tracking-wider flex items-center">
                    <AlertCircle size={10} className="mr-1" /> Müsait araç yok!
                  </p>
                ) : (
                  <p className="text-[9px] text-green-500 font-black uppercase tracking-wider flex items-center">
                    <CheckCircle2 size={10} className="mr-1" /> {availableVehicles.length} araç müsait.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notlar */}
          <div className="space-y-2">
            <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
              <Info size={12} className="mr-2 text-red-500" />  Ek Not Bırakmak İster Misiniz?
            </label>
            <textarea
              rows="3"
              placeholder="Muhtemelen belirttiğim Saatten, 2 Saat erken döneceğiz..."
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl md:rounded-[2rem] focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-medium text-gray-700 placeholder:text-gray-300 resize-none"
              value={reservation.notes}
              onChange={(e) => setReservation({...reservation, notes: e.target.value})}
            />
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 md:gap-6 pt-2">
          <button
            type="button"
            onClick={() => navigate('/reservations')}
            className="w-full sm:w-auto text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all py-3 order-2 sm:order-1"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={submitting || availableVehicles.length === 0}
            className="w-full sm:w-auto min-w-[200px] py-4 md:py-5 bg-red-600 text-white rounded-2xl md:rounded-[1.8rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-200 hover:bg-red-700 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2 group order-1 sm:order-2"
          >
            {submitting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                <span>Onaya Gönder</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;