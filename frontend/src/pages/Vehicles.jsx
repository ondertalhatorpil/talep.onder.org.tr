import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../services/api';
import useAuthStore from '../store/authStore';
import { 
  Plus, 
  Search, 
  Filter, 
  Car, 
  Settings, 
  Trash2, 
  CalendarPlus,
  Info
} from 'lucide-react';

const Vehicles = () => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehicleService.getAllVehicles();
        setVehicles(data);
        setLoading(false);
      } catch (err) {
        setError('Araçlar yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);
  
  const getStatusStyles = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'inactive':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'maintenance':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'maintenance': return 'Bakımda';
      default: return status;
    }
  };
  
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const handleDeleteVehicle = async (id) => {
    if (!isAdmin) return;
    if (window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      try {
        await vehicleService.deleteVehicle(id);
        setVehicles(vehicles.filter(v => v.id !== id));
      } catch (err) {
        setError('Araç silinirken bir hata oluştu');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Filo Yükleniyor</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-fadeIn">
      {/* Üst Başlık ve Ekleme Butonu */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.25em] flex items-center mb-2">
            <span className="w-8 h-[1px] bg-red-600 mr-3"></span>
            Envanter Yönetimi
          </h2>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Araç <span className="text-red-600">Filosu</span></h1>
        </div>
        
        {isAdmin && (
          <Link
            to="/vehicles/new"
            className="bg-red-600 text-white px-8 py-4 rounded-[1.5rem] font-bold text-sm hover:bg-red-700 transition-all shadow-xl shadow-red-100 flex items-center justify-center group"
          >
            <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Yeni Araç Ekle
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center">
          <Info size={18} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Filtreleme ve Arama Çubuğu */}
      <div className="bg-white p-3 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Plaka veya model ile hızlı ara..."
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-red-500/10 transition-all text-sm font-semibold text-gray-700 placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative min-w-[200px] group">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-500 transition-colors" size={18} />
          <select
            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-600 appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif Araçlar</option>
            <option value="inactive">Pasif Araçlar</option>
            <option value="maintenance">Bakımdakiler</option>
          </select>
        </div>
      </div>
      
      {/* Araç Kartları (Grid Yapısı) */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/40 relative overflow-hidden">
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                  <Car size={30} strokeWidth={1.5} />
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyles(vehicle.status)}`}>
                  {getStatusText(vehicle.status)}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {vehicle.brand} <span className="text-gray-400 font-bold">{vehicle.model}</span>
                </h3>
                <p className="text-sm font-black text-red-600/80 uppercase tracking-widest leading-none">
                  {vehicle.license_plate}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50">
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] leading-relaxed italic">
                  {vehicle.description || 'Bu araç için herhangi bir ek açıklama belirtilmemiş.'}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                {isAdmin ? (
                  <>
                    <Link
                      to={`/vehicles/${vehicle.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                    >
                      <Settings size={14} /> Düzenle
                    </Link>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
                      title="Aracı Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <Link
                    to={`/reservations/new?vehicle=${vehicle.id}`}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                  >
                    <CalendarPlus size={18} /> Rezervasyon Yap
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Boş Durum */
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car size={40} className="text-gray-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Araç Bulunamadı</h3>
          <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm font-medium">
            Arama kriterlerinize uygun bir araç bulunamadı. Lütfen filtreleri kontrol edin.
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="mt-8 text-xs font-black text-red-600 uppercase tracking-widest border-b-2 border-red-600 pb-1"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Vehicles;