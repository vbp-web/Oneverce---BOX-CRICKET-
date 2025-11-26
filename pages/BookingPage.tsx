import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Turf, Booking, TimeSlot } from '../types';
import { ChevronLeft, Calendar as CalendarIcon, Clock, CheckCircle, X } from 'lucide-react';

const SLOT_HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM (23)

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [turf, setTurf] = useState<Turf | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [userName, setUserName] = useState('');
  const [mobile, setMobile] = useState('');

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const t = await api.getTurfById(id);
      if (t) setTurf(t);
    };
    loadData();
  }, [id]);

  // Load bookings when date/turf changes
  useEffect(() => {
    const fetchBookings = async () => {
      if (!id) return;
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await api.getBookings(id, dateStr);
      setBookings(data);
    };
    fetchBookings();
  }, [id, selectedDate]);

  // Generate Week Dates
  const getNextDays = (days: number) => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getNextDays(7);

  // Slot Logic
  const getSlotStatus = (hour: number) => {
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const isBooked = bookings.some(b => b.timeSlot === timeStr);
    
    // Check past time if today
    const now = new Date();
    const isToday = now.toISOString().split('T')[0] === dateStr;
    const isPast = isToday && hour <= now.getHours();

    if (isBooked) return 'booked';
    if (isPast) return 'disabled';
    if (selectedSlot === timeStr) return 'selected';
    return 'available';
  };

  const handleSlotClick = (hour: number) => {
    const status = getSlotStatus(hour);
    if (status === 'booked' || status === 'disabled') return;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    setSelectedSlot(timeStr);
    setShowModal(true);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turf || !selectedSlot) return;

    setSubmitting(true);
    try {
      await api.createBooking({
        turfId: turf.id,
        turfName: turf.name,
        userName,
        mobile,
        date: selectedDate.toISOString().split('T')[0],
        timeSlot: selectedSlot
      });
      
      // Refresh bookings
      const dateStr = selectedDate.toISOString().split('T')[0];
      const newBookings = await api.getBookings(turf.id, dateStr);
      setBookings(newBookings);
      
      setShowModal(false);
      setSelectedSlot(null);
      setUserName('');
      setMobile('');
      alert('Booking Confirmed!');
    } catch (err: any) {
      alert(err.message || 'Booking Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!turf) return <div className="p-10 text-center text-neutral-500">Loading details...</div>;

  return (
    <div className="relative min-h-screen pb-20">
        {/* Header Image */}
        <div className="relative h-64 w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
            <img src={turf.image} alt={turf.name} className="w-full h-full object-cover" />
            <button 
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 z-20 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition"
            >
                <ChevronLeft size={24} />
            </button>
            <div className="absolute bottom-6 left-6 z-20">
                <h1 className="text-3xl font-bold mb-1">{turf.name}</h1>
                <p className="text-neutral-300 flex items-center text-sm">
                    <MapPin size={14} className="mr-1" /> {turf.location}
                </p>
            </div>
        </div>

        <div className="p-6">
            {/* Date Picker */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                    <CalendarIcon size={18} className="mr-2 text-orange-500" /> 
                    Select Date
                </h2>
                <span className="text-xs text-neutral-500">{selectedDate.toLocaleDateString()}</span>
            </div>
            
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-6">
                {weekDates.map((date) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl transition-all border ${
                                isSelected 
                                ? 'bg-gradient-to-br from-orange-500 to-red-600 border-transparent text-white shadow-lg shadow-orange-900/50' 
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600'
                            }`}
                        >
                            <span className="text-xs font-medium uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="text-xl font-bold">{date.getDate()}</span>
                        </button>
                    );
                })}
            </div>

            {/* Slots Grid */}
            <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock size={18} className="mr-2 text-orange-500" />
                Available Slots
            </h2>
            
            <div className="grid grid-cols-3 gap-3 mb-8">
                {SLOT_HOURS.map((hour) => {
                    const status = getSlotStatus(hour);
                    const timeLabel = `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`;
                    const timeRange = `${timeLabel} - ${hour > 12 ? hour - 11 : hour + 1} ${hour + 1 >= 12 ? 'PM' : 'AM'}`;

                    let btnClass = "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600";
                    if (status === 'booked') btnClass = "bg-red-900/20 border-red-900/50 text-red-700 cursor-not-allowed opacity-60";
                    if (status === 'disabled') btnClass = "bg-neutral-900/50 border-neutral-800 text-neutral-700 cursor-not-allowed";
                    if (status === 'selected') btnClass = "bg-blue-600 border-blue-500 text-white";
                    if (status === 'available') btnClass = "bg-green-900/20 border-green-900/50 text-green-400 hover:bg-green-900/30 cursor-pointer";

                    return (
                        <button
                            key={hour}
                            disabled={status === 'booked' || status === 'disabled'}
                            onClick={() => handleSlotClick(hour)}
                            className={`py-3 rounded-xl border text-sm font-medium transition-all ${btnClass}`}
                        >
                            {timeRange}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex justify-between px-2 text-xs text-neutral-500">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-900/50 border border-green-700 mr-2"></div> Available</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-900/50 border border-red-900 mr-2"></div> Booked</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-neutral-800 border border-neutral-700 mr-2"></div> Past</div>
            </div>
        </div>

        {/* Booking Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-neutral-900 w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Confirm Booking</h3>
                        <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-neutral-800/50 rounded-xl p-4 mb-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Turf</span>
                            <span className="text-white font-medium">{turf.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Date</span>
                            <span className="text-white font-medium">{selectedDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Time</span>
                            <span className="text-orange-400 font-bold text-base">{selectedSlot}</span>
                        </div>
                        <div className="border-t border-white/10 my-2"></div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">Price</span>
                            <span className="text-white font-medium">₹{turf.pricePerHour}</span>
                        </div>
                    </div>

                    <form onSubmit={handleBook} className="space-y-4">
                        <div>
                            <label className="block text-xs text-neutral-400 mb-1 ml-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-400 mb-1 ml-1">Mobile Number</label>
                            <input 
                                type="tel" 
                                required
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="10-digit number"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 hover:bg-neutral-200 transition-colors disabled:opacity-50 flex justify-center items-center"
                        >
                            {submitting ? 'Booking...' : 'Pay & Confirm'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

// Quick helper for map icon since I used it above
const MapPin = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export default BookingPage;