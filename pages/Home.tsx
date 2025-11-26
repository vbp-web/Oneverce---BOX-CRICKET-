import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Turf } from '../types';
import { MapPin, UserCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const data = await api.getTurfs();
        setTurfs(data);
      } catch (err) {
        console.error("Failed to load turfs");
      } finally {
        setLoading(false);
      }
    };
    fetchTurfs();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ONEVERCE</h1>
          <p className="text-neutral-400 text-sm">Box Cricket Booking – Kalol</p>
        </div>
        <div className="bg-neutral-800 p-2 rounded-full">
            <UserCircle2 className="w-6 h-6 text-neutral-300" />
        </div>
      </div>

      {/* "This Week" Card */}
      <div className="bg-neutral-900 rounded-3xl p-6 mb-8 relative overflow-hidden border border-white/5">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-light text-white">This Week</h2>
            <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-white/70">Status</span>
          </div>
          <p className="text-neutral-400 mb-6 text-sm">No bookings coming up at present.</p>
          
          <button className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-200 transition-colors">
            View My Bookings
          </button>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-bl-full pointer-events-none"></div>
      </div>

      {/* Section Title */}
      <h3 className="text-lg font-semibold mb-4 text-neutral-200">Turfs in Kalol</h3>

      {/* Turf List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-neutral-500">Loading grounds...</div>
        ) : (
          turfs.map((turf) => (
            <div 
              key={turf.id}
              onClick={() => navigate(`/turf/${turf.id}`)}
              className="group relative bg-neutral-900 rounded-3xl p-1 cursor-pointer transition-all active:scale-95 border border-neutral-800 hover:border-neutral-700"
            >
              <div className="flex h-32">
                {/* Content Side */}
                <div className="flex-1 p-5 flex flex-col justify-center z-10">
                  <h4 className="text-lg font-bold text-white mb-1 leading-tight">{turf.name}</h4>
                  <div className="flex items-center text-neutral-400 text-xs mb-3">
                    <MapPin size={12} className="mr-1" />
                    {turf.location}
                  </div>
                  <div className="flex items-center text-orange-400 text-xs font-medium group-hover:translate-x-1 transition-transform">
                    Book Slot <ArrowRight size={12} className="ml-1" />
                  </div>
                </div>

                {/* Image/Gradient Side */}
                <div className="w-1/3 relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 to-red-900/80 z-10 mix-blend-multiply"></div>
                    <img 
                        src={turf.image} 
                        alt={turf.name} 
                        className="w-full h-full object-cover"
                    />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;