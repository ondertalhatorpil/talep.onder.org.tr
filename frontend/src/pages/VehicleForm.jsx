// src/pages/VehicleForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/api';
import useAuthStore from '../store/authStore';

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
  
  // Admin kontrolü
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/vehicles');
    }
  }, [user, navigate]);
  
  // Düzenleme modunda aracı getir
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
          console.error(err);
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
    
    // Form doğrulama
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditing ? 'Araç Düzenle' : 'Yeni Araç Ekle'}
        </h1>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => navigate('/vehicles')}
          >
            İptal
          </button>
        </div>
      </div>
        
      {error && (
        <div className="flex items-center p-4 mb-6 text-red-800 rounded-lg bg-red-50 border-l-4 border-red-500" role="alert">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
        
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                <div className="relative">
                  <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700 mb-1">
                    Plaka <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="license_plate"
                    id="license_plate"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={vehicle.license_plate}
                    onChange={handleChange}
                    placeholder="34ABC123"
                  />
                </div>
                
                <div className="relative">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={vehicle.status}
                    onChange={handleChange}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="maintenance">Bakımda</option>
                  </select>
                </div>
                
                <div className="relative">
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                    Marka <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    id="brand"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={vehicle.brand}
                    onChange={handleChange}
                    placeholder="Toyota, Ford, vb."
                  />
                </div>
                
                <div className="relative">
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    id="model"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={vehicle.model}
                    onChange={handleChange}
                    placeholder="Corolla, Focus, vb."
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={vehicle.description || ''}
                    onChange={handleChange}
                    placeholder="Araç hakkında detaylar (renk, özellikler, vb.)"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </span>
                  ) : (
                    'Kaydet'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleForm;