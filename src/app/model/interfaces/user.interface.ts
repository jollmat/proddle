export interface UserInterface {
  username?: string;
  email: string;
  password?: string;
  admin?: boolean;
  lastLogin?: number;
  photoURL?: string;
  ip?: any;
  country?: string;
  city?: string;
}
