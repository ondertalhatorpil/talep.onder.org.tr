import { useState, useEffect } from 'react';
import { isSameDay } from 'date-fns';
import { reservationService, vehicleService } from '../../services/api';
import useAuthStore from '../../store/authStore';

// Komponentler
import StatisticsCards from './components/StatisticsCards';
import QuickActions from './components/QuickActions';
import UpcomingReservations from './components/UpcomingReservations';
import VehiclesList from './components/VehiclesList';
import TipsAndShortcuts from './components/TipsAndShortcuts';
import LoadingSpinner from './components/Common/ErrorMessage';
import ErrorMessage from './components/Common/ErrorMessage';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Sayfa yüklendiğinde animasyonu başlat
    setAnimate(true);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Rezervasyonları getir
        const allReservations = await reservationService.getAllReservations();
        
        // Şu anki tarihten sonraki rezervasyonları filtrele
        const now = new Date();
        const upcoming = allReservations
          .filter(res => new Date(res.start_date_time) > now)
          .filter(res => res.status === 'approved' || res.status === 'pending')
          .sort((a, b) => new Date(a.start_date_time) - new Date(b.start_date_time))
          .slice(0, 3); // İlk 5 rezervasyon
        
        setUpcomingReservations(upcoming);
        
        // Araçları getir
        const allVehicles = await vehicleService.getAllVehicles();
        setVehicles(allVehicles);
        
        setLoading(false);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu.');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, []);
  
  // Bugün olup olmadığını kontrol et
  const isToday = (date) => {
    return isSameDay(new Date(date), new Date());
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-8">
      
      {/* İstatistikler */}
      <StatisticsCards 
        vehicles={vehicles} 
        upcomingReservations={upcomingReservations} 
        animate={animate} 
      />
      
      {/* Hızlı İşlemler */}
      <QuickActions animate={animate} />
      
      {/* Ana Bölüm - Yaklaşan Rezervasyonlar ve Araçlar */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transform transition duration-700 delay-300 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Yaklaşan Rezervasyonlar */}
        <UpcomingReservations 
          reservations={upcomingReservations}
          animate={animate}
          isToday={isToday}
        />
        
        {/* Araçlar */}
        <VehiclesList 
          vehicles={vehicles}
          animate={animate}
          isAdmin={user?.role === 'admin'}
        />
      </div>
      
      {/* Son Etkinlikler ve İpuçları */}
      <TipsAndShortcuts animate={animate} />
    </div>
  );
};

export default Dashboard;