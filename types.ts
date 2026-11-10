export type EventCategory = 'Conference' | 'Workshop' | 'Meetup' | 'Webinar' | 'Networking' | 'Executive';

export type EventStatus = 'Upcoming' | 'In Progress' | 'Completed';

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  speakerOrLead?: string;
  notes?: string;
}

export interface Registration {
  id: number;
  name: string;
  email: string;
  checkedIn?: boolean;
  registeredAt?: string;
}

export interface Event {
  id: string | number;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  isVirtual?: boolean;
  category?: EventCategory;
  status?: EventStatus;
  capacity?: number;
  registrations: Registration[];
  agenda?: AgendaItem[];
  ownerId?: string;
  creatorEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  isLoading?: boolean;
}

export interface User {
  uid?: string;
  name: string;
  email: string;
  role?: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}
