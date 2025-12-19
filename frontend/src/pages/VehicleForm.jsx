import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/api';
import useAuthStore from '../store/authStore';
import { 
  ArrowLeft, 
  Save, 
  Car, 
  Tag, 
  Settings, 
  FileText,
  AlertCircle 
} from 'lucide-react';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEditing = !!id;
  
  const [vehicle, setVehicle] = useState({
    license_plate: '',
    brand: '',
    model: '',
    description: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/vehicles');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (isEditing) {
      const fetchVehicle = async () => {
        try {
          setLoading(true);
          const data = await vehicleService.getVehicleById(id);
          setVehicle(data);
          setLoading(false);
        } catch (err) {
          setError('Araç bilgileri yüklenirken bir hata oluştu');
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  }, [id, isEditing]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicle.license_plate || !vehicle.brand || !vehicle.model) {
      setError('Plaka, marka ve model alanları zorunludur');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      if (isEditing) {
        await vehicleService.updateVehicle(id, vehicle);
      } else {
        await vehicleService.createVehicle(vehicle);
      }
      navigate('/vehicles');
    } catch (err) {
      setError(err.response?.data?.message || 'Araç kaydedilirken bir hata oluştu');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin"></div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Bilgiler Hazırlanıyor</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header Alanı */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <button 
            onClick={() => navigate('/vehicles')}
            className="flex items-center text-xs font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors mb-2 group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Geri Dön
          </button>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {isEditing ? 'Aracı' : 'Yeni'} <span className="text-red-600">{isEditing ? 'Düzenle' : 'Araç Tanımla'}</span>
          </h1>
        </div>
      </div>
        
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-[1.5rem] p-5 flex items-center text-red-600 mb-8 animate-shake">
          <AlertCircle size={20} className="mr-3 shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}
        
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            
            {/* Plaka Girişi */}
            <div className="space-y-2">
              <label className="flex items-center text-xs font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                <Tag size={14} className="mr-2 text-red-500" /> Plaka No
              </label>
              <input
                type="text"
                name="license_plate"
                required
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300 uppercase"
                value={vehicle.license_plate}
                onChange={handleChange}
                placeholder="34 ABC 123"
              />
            </div>

            {/* Durum Seçimi */}
            <div className="space-y-2">
              <label className="flex items-center text-xs font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                <Settings size={14} className="mr-2 text-red-500" /> Araç Durumu
              </label>
              <select
                name="status"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                value={vehicle.status}
                onChange={handleChange}
              >
                <option value="active">Aktif (Kullanılabilir)</option>
                <option value="inactive">Pasif (Kullanım Dışı)</option>
                <option value="maintenance">Bakımda (Servis)</option>
              </select>
            </div>

            {/* Marka Girişi */}
            <div className="space-y-2">
              <label className="flex items-center text-xs font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                <Car size={14} className="mr-2 text-red-500" /> Marka
              </label>
              <input
                type="text"
                name="brand"
                required
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                value={vehicle.brand}
                onChange={handleChange}
                placeholder="Örn: Volkswagen"
              />
            </div>

            {/* Model Girişi */}
            <div className="space-y-2">
              <label className="flex items-center text-xs font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                <Car size={14} className="mr-2 text-red-500" /> Model
              </label>
              <input
                type="text"
                name="model"
                required
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                value={vehicle.model}
                onChange={handleChange}
                placeholder="Örn: Passat"
              />
            </div>

            {/* Açıklama Alanı */}
            <div className="md:col-span-2 space-y-2">
              <label className="flex items-center text-xs font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                <FileText size={14} className="mr-2 text-red-500" /> Araç Detayları / Notlar
              </label>
              <textarea
                name="description"
                rows="4"
                className="w-full px-6 py-5 bg-gray-50 border-none rounded-[2rem] focus:ring-4 focus:ring-red-500/10 transition-all text-sm font-medium text-gray-700 placeholder:text-gray-300 resize-none"
                value={vehicle.description || ''}
                onChange={handleChange}
                placeholder="Araca dair özel detaylar veya notlar ekleyebilirsiniz..."
              />
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="w-full sm:w-auto px-10 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 bg-red-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-100 disabled:opacity-70 group"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} className="group-hover:scale-110 transition-transform" />
                Sisteme Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;