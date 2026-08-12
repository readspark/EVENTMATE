
export interface Registration {
  id: number;
  name: string;
  email: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  registrations: Registration[];
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  isLoading?: boolean;
}

export interface User {
  name: string;
  email: string;
}
