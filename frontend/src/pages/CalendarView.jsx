// src/pages/Calendar.jsx
import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { reservationService } from '../services/api';
import useAuthStore from '../store/authStore';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import '../assets/style/calendar.css';

const locales = {
  'tr': tr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Türkçe mesajlar
const messages = {
  today: 'Bugün',
  previous: 'Önceki',
  next: 'Sonraki',
  month: 'Ay',
  week: 'Hafta',
  day: 'Gün',
  agenda: 'Ajanda',
  date: 'Tarih',
  time: 'Saat',
  event: 'Etkinlik',
  allDay: 'Tüm gün',
  noEventsInRange: 'Bu aralıkta hiç rezervasyon yok.',
};

const CalendarView = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [vehicles, setVehicles] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showLegend, setShowLegend] = useState(true);
  
  const isAdmin = user?.role === 'admin';
  
  // Rezervasyonları getir
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await reservationService.getAllReservations();
        
        // Takvim için rezervasyonları formatla
        const formattedReservations = data
          .filter(res => res.status === 'approved' || res.status === 'pending')
          .map(res => ({
            id: res.id,
            title: `${res.brand} ${res.model} - ${res.username}`,
            start: new Date(res.start_date_time),
            end: new Date(res.end_date_time),
            resource: {
              ...res,
              status: res.status,
              vehicle_id: res.vehicle_id,
              department: res.department
            }
          }));
        
        setReservations(formattedReservations);
        
        // Rezervasyonlarda bulunan araçları topla
        const uniqueVehicles = [...new Set(data.map(res => res.vehicle_id))].map(id => {
          const reservation = data.find(res => res.vehicle_id === id);
          return {
            id: id,
            name: `${reservation.brand} ${reservation.model} (${reservation.license_plate})`
          };
        });
        
        setVehicles(uniqueVehicles);
        
        // Rezervasyonlarda bulunan departmanları topla
        const uniqueDepartments = [...new Set(data.map(res => res.department))];
        setDepartments(uniqueDepartments);
        
        setLoading(false);
      } catch (err) {
        setError('Rezervasyonlar yüklenirken bir hata oluştu');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchReservations();
  }, []);
  
  // Etkinlik stillerini ayarla
  const eventStyleGetter = (event) => {
    let backgroundColor;
    let borderColor;
    
    // Durum bazlı renkler
    if (event.resource.status === 'approved') {
      backgroundColor = '#065f46'; // green-800
      borderColor = '#047857'; // green-700
    } else if (event.resource.status === 'pending') {
      backgroundColor = '#92400e'; // amber-800
      borderColor = '#b45309'; // amber-700
    }
    
    // Her departman için farklı renk tonları
    if (event.resource.department === 'Satış') {
      backgroundColor = event.resource.status === 'approved' ? '#064e3b' : '#783c00';
      borderColor = event.resource.status === 'approved' ? '#047857' : '#b45309';
    } else if (event.resource.department === 'Muhasebe') {
      backgroundColor = event.resource.status === 'approved' ? '#0f766e' : '#9a3412';
      borderColor = event.resource.status === 'approved' ? '#14b8a6' : '#ea580c';
    } else if (event.resource.department === 'Lojistik') {
      backgroundColor = event.resource.status === 'approved' ? '#0e7490' : '#854d0e';
      borderColor = event.resource.status === 'approved' ? '#06b6d4' : '#d97706';
    } else if (event.resource.department === 'Yönetim') {
      backgroundColor = event.resource.status === 'approved' ? '#0c4a6e' : '#7e22ce';
      borderColor = event.resource.status === 'approved' ? '#0284c7' : '#a855f7';
    }
    
    const style = {
      backgroundColor,
      borderColor,
      color: 'white',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '4px',
      opacity: 0.9,
      display: 'block',
      fontWeight: 600,
      fontSize: '0.8rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      padding: '2px 5px',
      overflow: 'hidden'
    };
    
    return { style };
  };
  
  // Seçili araca ve departmana göre filtre uygula
  const filteredEvents = useMemo(() => {
    let filtered = [...reservations];
    
    if (selectedVehicle !== 'all') {
      filtered = filtered.filter(event => 
        event.resource.vehicle_id === parseInt(selectedVehicle)
      );
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(event => 
        event.resource.department === selectedDepartment
      );
    }
    
    return filtered;
  }, [reservations, selectedVehicle, selectedDepartment]);
  
  // Etkinliğe tıklama işlemi
  const handleEventClick = (event) => {
    navigate(`/reservations/${event.id}`);
  };
  
  // Takvimde yeni etkinlik ekleme işlemi
  const handleSelectSlot = ({ start, end }) => {
    // En az 30 dakikalık bir aralık seçilmesini sağla
    const minEndTime = addHours(start, 0.5);
    const adjustedEnd = end < minEndTime ? minEndTime : end;
    
    // Yeni rezervasyon formuyla tarih/saat parametrelerini geçir
    navigate(`/reservations/new?start=${start.toISOString()}&end=${adjustedEnd.toISOString()}`);
  };
  
  // Özel günlük görünüm bileşeni
  const DayHeaderFormat = ({ date, localizer }) => {
    const isToday = isSameDay(date, new Date());
    
    return (
      <div className={`day-header ${isToday ? 'today' : ''}`}>
        <span className="day-name">{localizer.format(date, 'ddd', 'tr')}</span>
        <span className="day-number">{localizer.format(date, 'd', 'tr')}</span>
      </div>
    );
  };
  
  // Özel zaman slot oluşturucu
  const dayPropGetter = (date) => {
    const isToday = isSameDay(date, new Date());
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    return {
      className: `${isToday ? 'today-cell' : ''} ${isWeekend ? 'weekend-cell' : ''}`,
    };
  };
  
  // Yükleme göstergesi
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Takvim Görünümü</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin 
              ? 'Tüm departmanların rezervasyonlarını takvim üzerinde görüntüleyin' 
              : 'Departmanınızın rezervasyonlarını takvim üzerinde görüntüleyin'}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
          <Link
            to="/reservations/new"
            className="btn-primary flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yeni Rezervasyon
          </Link>
          {showLegend ? (
            <button 
              onClick={() => setShowLegend(false)} 
              className="text-sm text-gray-600 bg-white rounded-md shadow px-2 py-1 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Açıklamayı Gizle
            </button>
          ) : (
            <button 
              onClick={() => setShowLegend(true)} 
              className="text-sm text-gray-600 bg-white rounded-md shadow px-2 py-1 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Açıklamayı Göster
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Filtreler ve Kontroller */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="vehicle" className="form-label">Araç</label>
            <select
              id="vehicle"
              className="form-input"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="all">Tüm Araçlar</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </div>
          
          {isAdmin && (
            <div>
              <label htmlFor="department" className="form-label">Departman</label>
              <select
                id="department"
                className="form-input"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">Tüm Departmanlar</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label htmlFor="view" className="form-label">Görünüm</label>
            <select
              id="view"
              className="form-input"
              value={view}
              onChange={(e) => setView(e.target.value)}
            >
              <option value={Views.MONTH}>Aylık</option>
              <option value={Views.WEEK}>Haftalık</option>
              <option value={Views.DAY}>Günlük</option>
              <option value={Views.AGENDA}>Ajanda</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="form-label">Tarih</label>
            <input
              type="date"
              id="date"
              className="form-input"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
        </div>
      </div>
      
      {/* Efsane/Açıklama */}
      {showLegend && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Durum ve Departman Renkleri</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#065f46' }}></div>
              <span className="text-sm text-gray-600">Onaylanmış</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#92400e' }}></div>
              <span className="text-sm text-gray-600">Beklemede</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#064e3b' }}></div>
              <span className="text-sm text-gray-600">Teşkilat</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#0f766e' }}></div>
              <span className="text-sm text-gray-600">Öncü Spor</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#0e7490' }}></div>
              <span className="text-sm text-gray-600">ÖNDER Genç</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#0c4a6e' }}></div>
              <span className="text-sm text-gray-600">İktisadi İşletmeler</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Takvim */}
      <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
        <div className="calendar-container" style={{ height: 700 }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={messages}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            onSelectEvent={handleEventClick}
            onSelectSlot={handleSelectSlot}
            selectable
            culture="tr"
            views={{
              month: true,
              week: true,
              day: true
              }}
            view={view}
            onView={(newView) => setView(newView)}
            date={selectedDate}
            onNavigate={(date) => setSelectedDate(date)}
            components={{
              toolbar: CustomToolbar,
              day: { header: DayHeaderFormat },
              event: CustomEvent
            }}
            timeslots={2}
            step={30}
            formats={{
              timeGutterFormat: (date, culture, localizer) =>
                localizer.format(date, 'HH:mm', culture),
              selectRangeFormat: ({ start, end }, culture, localizer) =>
                `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
              eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
              agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
                `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Özel olay bileşeni
const CustomEvent = ({ event }) => {
  return (
    <div className="rbc-event-content">
      <div className="font-semibold">{event.title}</div>
      <div className="text-xs mt-1">
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
      </div>
    </div>
  );
};

// Özel araç çubuğu
const CustomToolbar = (toolbar) => {
  const navigate = (action) => {
    toolbar.onNavigate(action);
  };
  
  const viewNamesMap = {
    month: 'Ay',
    week: 'Hafta',
    day: 'Gün',
    agenda: 'Ajanda'
  };
  
  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <button type="button" onClick={() => navigate('TODAY')} className="toolbar-button">
          Bugün
        </button>
        <button type="button" onClick={() => navigate('PREV')} className="toolbar-button">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button type="button" onClick={() => navigate('NEXT')} className="toolbar-button">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <span className="rbc-toolbar-label font-medium">
        {format(toolbar.date, 'MMMM yyyy', { locale: tr })}
      </span>
      
      <div className="rbc-btn-group">
        {toolbar.views.map(view => (
          <button
            key={view}
            type="button"
            onClick={() => toolbar.onView(view)}
            className={`toolbar-button ${toolbar.view === view ? 'active' : ''}`}
          >
            {viewNamesMap[view] || view}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;