import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Booking, Turf, AdminTab } from '../types';
import { Trash2, Plus, Calendar, Clock, MapPin } from 'lucide-react';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.BOOKINGS);

  // Data State
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // New Turf Form State
  const [showAddTurf, setShowAddTurf] = useState(false);
  const [newTurf, setNewTurf] = useState({ name: '', location: '', image: '', pricePerHour: 0 });

  useEffect(() => {
    const checkAuth = sessionStorage.getItem('adminAuth');
    if (checkAuth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    const t = await api.getTurfs();
    const b = await api.getAllBookings();
    setTurfs(t);
    setBookings(b.sort((a, b) => b.createdAt - a.createdAt)); // Newest first
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      loadData();
    } else {
      alert('Invalid Credentials (try admin/password)');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm('Cancel this booking?')) {
      await api.deleteBooking(id);
      loadData();
    }
  };

  const handleDeleteTurf = async (id: string) => {
    if (confirm('Delete this turf? This will confuse existing bookings.')) {
      await api.deleteTurf(id);
      loadData();
    }
  };

  const handleAddTurf = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createTurf({
      ...newTurf,
      image: newTurf.image || `https://picsum.photos/800/400?random=${Math.random()}`
    });
    setShowAddTurf(false);
    setNewTurf({ name: '', location: '', image: '', pricePerHour: 0 });
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-neutral-900 p-8 rounded-3xl border border-white/10">
          <h1 className="text-2xl font-bold mb-6 text-center text-white">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Username (admin)" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
            />
            <input 
              type="password" 
              placeholder="Password (password)" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
            />
            <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button 
          onClick={() => {
            setIsAuthenticated(false);
            sessionStorage.removeItem('adminAuth');
          }}
          className="text-xs text-red-500 hover:text-red-400"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 bg-neutral-900 p-1 rounded-xl">
        <button 
          onClick={() => setActiveTab(AdminTab.BOOKINGS)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === AdminTab.BOOKINGS ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
        >
          Bookings
        </button>
        <button 
          onClick={() => setActiveTab(AdminTab.TURFS)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === AdminTab.TURFS ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
        >
          Turfs
        </button>
      </div>

      {/* Bookings View */}
      {activeTab === AdminTab.BOOKINGS && (
        <div className="space-y-4">
          {bookings.length === 0 && <p className="text-neutral-500 text-center">No bookings found.</p>}
          {bookings.map(booking => (
            <div key={booking.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white">{booking.turfName}</h4>
                <div className="flex items-center text-xs text-neutral-400 mt-1 space-x-3">
                  <span className="flex items-center"><Calendar size={12} className="mr-1"/> {booking.date}</span>
                  <span className="flex items-center text-orange-400"><Clock size={12} className="mr-1"/> {booking.timeSlot}</span>
                </div>
                <div className="mt-2 text-sm text-neutral-300">
                  {booking.userName} <span className="text-neutral-600">•</span> {booking.mobile}
                </div>
              </div>
              <button 
                onClick={() => handleDeleteBooking(booking.id)}
                className="p-2 bg-red-900/20 text-red-500 rounded-full hover:bg-red-900/40"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Turfs View */}
      {activeTab === AdminTab.TURFS && (
        <div className="space-y-4">
          <button 
            onClick={() => setShowAddTurf(!showAddTurf)}
            className="w-full py-3 border-2 border-dashed border-neutral-800 rounded-2xl text-neutral-400 hover:border-neutral-600 hover:text-white flex justify-center items-center transition-colors"
          >
            <Plus size={20} className="mr-2" /> Add New Turf
          </button>

          {showAddTurf && (
            <form onSubmit={handleAddTurf} className="bg-neutral-900 p-4 rounded-2xl border border-white/10 space-y-3">
              <input 
                placeholder="Turf Name" 
                required
                className="w-full bg-black p-3 rounded-lg border border-neutral-800 text-sm"
                value={newTurf.name} onChange={e => setNewTurf({...newTurf, name: e.target.value})}
              />
              <input 
                placeholder="Location" 
                required
                className="w-full bg-black p-3 rounded-lg border border-neutral-800 text-sm"
                value={newTurf.location} onChange={e => setNewTurf({...newTurf, location: e.target.value})}
              />
              <input 
                type="number"
                placeholder="Price Per Hour" 
                required
                className="w-full bg-black p-3 rounded-lg border border-neutral-800 text-sm"
                value={newTurf.pricePerHour || ''} onChange={e => setNewTurf({...newTurf, pricePerHour: Number(e.target.value)})}
              />
              <input 
                placeholder="Image URL (optional)" 
                className="w-full bg-black p-3 rounded-lg border border-neutral-800 text-sm"
                value={newTurf.image} onChange={e => setNewTurf({...newTurf, image: e.target.value})}
              />
              <button className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-sm">Save Turf</button>
            </form>
          )}

          {turfs.map(turf => (
            <div key={turf.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex gap-4">
              <img src={turf.image} className="w-16 h-16 rounded-lg object-cover bg-neutral-800" alt="Turf" />
              <div className="flex-1">
                <h4 className="font-bold text-white">{turf.name}</h4>
                <p className="text-xs text-neutral-400 flex items-center mt-1">
                  <MapPin size={12} className="mr-1"/> {turf.location}
                </p>
                <p className="text-xs text-orange-400 mt-1 font-semibold">₹{turf.pricePerHour}/hr</p>
              </div>
              <button 
                onClick={() => handleDeleteTurf(turf.id)}
                className="text-neutral-600 hover:text-red-500 h-fit"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;