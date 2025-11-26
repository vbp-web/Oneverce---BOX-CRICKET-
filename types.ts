export interface Turf {
  id: string;
  name: string;
  location: string;
  image: string;
  pricePerHour: number;
  description?: string;
}

export interface Booking {
  id: string;
  turfId: string;
  turfName: string;
  userName: string;
  mobile: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "06:00"
  createdAt: number;
}

export interface TimeSlot {
  time: string; // "06:00"
  label: string; // "6:00 AM"
  isBooked: boolean;
}

export enum AdminTab {
  TURFS = 'TURFS',
  BOOKINGS = 'BOOKINGS'
}