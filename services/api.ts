import { Turf, Booking } from '../types';

// Initial Data
const INITIAL_TURFS: Turf[] = [
  {
    id: '1',
    name: 'Shiva Cricket Box',
    location: 'Kalol – Panchvati',
    image: 'https://picsum.photos/800/400?random=1',
    pricePerHour: 800
  },
  {
    id: '2',
    name: 'Turbo Turf Arena',
    location: 'Kalol – Panchvati',
    image: 'https://picsum.photos/800/400?random=2',
    pricePerHour: 900
  },
  {
    id: '3',
    name: 'Sixer Box Cricket',
    location: 'Kalol City',
    image: 'https://picsum.photos/800/400?random=3',
    pricePerHour: 750
  },
  {
    id: '4',
    name: 'Black Panther Turf',
    location: 'Chattral Road',
    image: 'https://picsum.photos/800/400?random=4',
    pricePerHour: 1000
  },
  {
    id: '5',
    name: 'Royal Box Cricket',
    location: 'Kanbha Side',
    image: 'https://picsum.photos/800/400?random=5',
    pricePerHour: 850
  },
  {
    id: '6',
    name: '7 Star Cricket Arena',
    location: 'Jethlaj Road',
    image: 'https://picsum.photos/800/400?random=6',
    pricePerHour: 1200
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private getStorage<T>(key: string, defaultData: T): T {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(stored);
  }

  private setStorage(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- TURF ENDPOINTS ---

  async getTurfs(): Promise<Turf[]> {
    await delay(300);
    return this.getStorage<Turf[]>('turfs', INITIAL_TURFS);
  }

  async getTurfById(id: string): Promise<Turf | undefined> {
    await delay(200);
    const turfs = this.getStorage<Turf[]>('turfs', INITIAL_TURFS);
    return turfs.find(t => t.id === id);
  }

  async createTurf(turf: Omit<Turf, 'id'>): Promise<Turf> {
    await delay(400);
    const turfs = this.getStorage<Turf[]>('turfs', INITIAL_TURFS);
    const newTurf = { ...turf, id: Math.random().toString(36).substr(2, 9) };
    turfs.push(newTurf);
    this.setStorage('turfs', turfs);
    return newTurf;
  }

  async deleteTurf(id: string): Promise<void> {
    await delay(300);
    let turfs = this.getStorage<Turf[]>('turfs', INITIAL_TURFS);
    turfs = turfs.filter(t => t.id !== id);
    this.setStorage('turfs', turfs);
  }

  // --- BOOKING ENDPOINTS ---

  async getBookings(turfId: string, date: string): Promise<Booking[]> {
    await delay(300);
    const bookings = this.getStorage<Booking[]>('bookings', []);
    return bookings.filter(b => b.turfId === turfId && b.date === date);
  }

  async getAllBookings(): Promise<Booking[]> {
    await delay(300);
    return this.getStorage<Booking[]>('bookings', []);
  }

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    await delay(500);
    const bookings = this.getStorage<Booking[]>('bookings', []);
    
    // Check double booking
    const exists = bookings.find(b => 
      b.turfId === booking.turfId && 
      b.date === booking.date && 
      b.timeSlot === booking.timeSlot
    );

    if (exists) {
      throw new Error("Slot already booked!");
    }

    const newBooking: Booking = {
      ...booking,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };

    bookings.push(newBooking);
    this.setStorage('bookings', bookings);
    return newBooking;
  }

  async deleteBooking(id: string): Promise<void> {
    await delay(300);
    let bookings = this.getStorage<Booking[]>('bookings', []);
    bookings = bookings.filter(b => b.id !== id);
    this.setStorage('bookings', bookings);
  }
}

export const api = new ApiService();