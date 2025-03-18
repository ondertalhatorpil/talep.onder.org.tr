import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/reservations';

const MONTHS = [
  { value: '', label: 'Tüm Aylar' },
  { value: '0', label: 'Ocak' },
  { value: '1', label: 'Şubat' },
  { value: '2', label: 'Mart' },
  { value: '3', label: 'Nisan' },
  { value: '4', label: 'Mayıs' },
  { value: '5', label: 'Haziran' },
  { value: '6', label: 'Temmuz' },
  { value: '7', label: 'Ağustos' },
  { value: '8', label: 'Eylül' },
  { value: '9', label: 'Ekim' },
  { value: '10', label: 'Kasım' },
  { value: '11', label: 'Aralık' }
];

const ReservationList = () => {
  const [reservations, setReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtre state'leri
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reservationsRes, vehiclesRes] = await Promise.all([
          axios.get(`${API_URL}/public/calendar`),
          axios.get(`${API_URL}/public/vehicles`)
        ]);

        setReservations(reservationsRes.data);
        setVehicles(vehiclesRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        setError('Veriler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: tr });
  };

  const formatTime = (date) => {
    return format(new Date(date), 'HH:mm', { locale: tr });
  };

  const filteredReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.start_date_time);
    
    const matchVehicle = selectedVehicle === 'all' || reservation.vehicle_id.toString() === selectedVehicle;
    const matchDate = !selectedDate || format(reservationDate, 'yyyy-MM-dd') === selectedDate;
    const matchMonth = !selectedMonth || reservationDate.getMonth().toString() === selectedMonth;
    const matchSearch = searchTerm === '' || 
      reservation.vehicle_license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${reservation.vehicle_brand} ${reservation.vehicle_model}`.toLowerCase().includes(searchTerm.toLowerCase());

    return matchVehicle && matchDate && matchMonth && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center p-8 rounded-2xl bg-white shadow-lg">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-2xl p-8 text-white">
          <h1 className="text-3xl font-bold">Araç Rezervasyonları</h1>
          <p className="mt-2 opacity-90">Mevcut tüm rezervasyonları görüntüleyin ve filtreleyebilirsiniz</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 shadow-lg rounded-b-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Araç Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Araç</label>
              <select
                className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-shadow"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="all">Tüm Araçlar</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                  </option>
                ))}
              </select>
            </div>

            {/* Ay Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ay</label>
              <select
                className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-shadow"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {MONTHS.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tarih Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
              <input
                type="date"
                className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-shadow"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Rezervasyon Listesi */}
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-500">Filtrelere uygun rezervasyon bulunamadı.</p>
            </div>
          ) : (
            filteredReservations.map(reservation => (
              <div 
                key={reservation.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-2xl">🚗</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.vehicle_brand} {reservation.vehicle_model}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {reservation.vehicle_license_plate}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-gray-900 font-medium">
                      {formatDate(reservation.start_date_time)}
                    </div>
                    <div className="text-gray-500 text-sm mt-1">
                      {formatTime(reservation.start_date_time)} - {formatTime(reservation.end_date_time)}
                    </div>
                    <span className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Onaylandı
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationList;