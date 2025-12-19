import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import trLocale from '@fullcalendar/core/locales/tr';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar as CalendarIcon,
  Car
} from 'lucide-react';

import { reservationService } from '../services/api';
import useAuthStore from '../store/authStore';

const CalendarView = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await reservationService.getAllReservations();
        
        const formatted = data
          .filter(res => res.status === 'approved' || res.status === 'pending')
          .map(res => ({
            id: res.id,
            title: `${res.brand} ${res.model}`,
            start: res.start_date_time,
            end: res.end_date_time,
            backgroundColor: res.status === 'approved' ? '#fef2f2' : '#fffbeb',
            borderColor: res.status === 'approved' ? '#fca5a5' : '#fcd34d',
            textColor: res.status === 'approved' ? '#991b1b' : '#92400e',
            extendedProps: { ...res }
          }));
        
        setReservations(formatted);
        const uniqueVehicles = [...new Set(data.map(r => JSON.stringify({id: r.vehicle_id, name: `${r.brand} ${r.model}`})))]
          .map(s => JSON.parse(s));
        setVehicles(uniqueVehicles);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const filteredEvents = useMemo(() => {
    return selectedVehicle === 'all' 
      ? reservations 
      : reservations.filter(e => e.extendedProps.vehicle_id === parseInt(selectedVehicle));
  }, [reservations, selectedVehicle]);

  const renderEventContent = (eventInfo) => {
    const isApproved = eventInfo.event.extendedProps.status === 'approved';
    return (
      <div className="flex items-center gap-1 px-1 py-0.5 md:px-2 md:py-1 overflow-hidden">
        <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full shrink-0 ${isApproved ? 'bg-red-600' : 'bg-amber-500 animate-pulse'}`} />
        <span className="truncate font-bold text-[8px] sm:text-[9px] md:text-[11px] uppercase tracking-tighter leading-tight">
          {eventInfo.event.title}
        </span>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col h-96 items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yükleniyor</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 pb-10 animate-fadeIn px-2 md:px-0">
      {/* Üst Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="px-1">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center mb-1">
            <span className="w-5 h-[1px] bg-red-600 mr-2"></span>
            Planlama
          </h2>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Rezervasyon <span className="text-red-600">Takvimi</span>
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 bg-white p-2 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="relative group w-full sm:w-auto">
            <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-500 transition-colors" size={16} />
            <select 
              value={selectedVehicle} 
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full pl-11 pr-8 py-2.5 bg-gray-50 border-none rounded-xl md:rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-red-500/10 cursor-pointer appearance-none min-w-full sm:min-w-[200px]"
            >
              <option value="all">Tüm Filo</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <button 
            onClick={() => navigate('/reservations/new')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl md:rounded-[1.5rem] transition-all shadow-lg shadow-red-100 active:scale-95 group"
          >
            <Plus size={16} />
            <span className="font-black text-[11px] uppercase tracking-widest">Yeni</span>
          </button>
        </div>
      </div>

      {/* Takvim Kartı */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden p-2 md:p-8 relative">
        <style>{`
          /* Mobil Ölçeklendirme Kuralları */
          .fc { font-family: inherit; font-size: 0.85rem; }
          @media (max-width: 768px) {
            .fc { font-size: 0.65rem; }
            .fc .fc-toolbar { flex-direction: column; gap: 8px; }
            .fc .fc-toolbar-title { font-size: 0.9rem !important; }
            .fc .fc-button { padding: 0.4rem 0.8rem !important; font-size: 0.6rem !important; }
            .fc .fc-col-header-cell-cushion { font-size: 0.55rem !important; letter-spacing: 0.05em !important; }
            .fc .fc-daygrid-day-number { font-size: 0.7rem !important; padding: 4px 6px !important; }
            .fc .fc-daygrid-event-h-harness { margin-top: 1px !important; }
          }
          
          .fc { --fc-border-color: #f3f4f6; --fc-today-bg-color: #fef2f2; }
          .fc .fc-toolbar-title { font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #111827; }
          .fc .fc-button-primary { background: #f9fafb; border: 1px solid #f3f4f6; color: #374151; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 0.75rem !important; transition: all 0.2s; }
          .fc .fc-button-primary:hover { background: #f3f4f6; color: #111827; }
          .fc .fc-button-active { background: #111827 !important; border-color: #111827 !important; color: #fff !important; }
          .fc .fc-col-header-cell { padding: 0.5rem 0; background: #fafafa; }
          .fc .fc-col-header-cell-cushion { font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; }
          .fc .fc-daygrid-day-number { font-weight: 800; color: #4b5563; }
          .fc .fc-event { border-radius: 4px; border-width: 1px; margin: 1px 2px !important; }
          .fc .fc-daygrid-more-link { font-size: 0.6rem; font-weight: 900; color: #ef4444; text-transform: uppercase; padding-left: 4px; }
        `}</style>
        
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView={window.innerWidth < 768 ? 'listMonth' : 'dayGridMonth'} // Mobilde direkt liste ile başlayabilir
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listMonth'
          }}
          buttonText={{
            today: 'Bugün',
            month: 'Aylık',
            list: 'Liste'
          }}
          locale={trLocale}
          events={filteredEvents}
          height="auto"
          eventContent={renderEventContent}
          eventClick={(info) => navigate(`/reservations/${info.event.id}`)}
          dayMaxEvents={2} // Mobilde çakışmayı önlemek için 2'den sonrasını gizle
        />
      </div>

      {/* Legend / Bilgilendirme */}
      <div className="flex flex-row justify-center gap-4 md:gap-8 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Onaylı</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Bekleyen</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;