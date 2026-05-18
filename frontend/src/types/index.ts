export type UserRole = "User" | "lender" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  isVerified: boolean;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data: T;
}

export type CarStatus = "available" | "rented" | "maintenance" | "unavailable";

export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  description: string;
  pricePerDay: number;
  locationCity: string;
  availabilityStatus: CarStatus;
  lenderId: string;
  categoryId: number;
  fuelType?: string;
  transmission?: string;
  seats?: number;
  topSpeed?: number;
  acceleration?: string;
  enginePower?: string;
  latitude?: number;
  longitude?: number;
  averageRating?: number;

  totalReviews?: number;
  images: Array<{
    id: string;
    imageUrl: string;
    isMain: boolean;
  }>;
  category: {
    id: number;
    name: string;
  };
  lender: {
    id: string;
    name: string;
    profileImage: string;
    createdAt?: string;
    totalTrips?: number;
  };
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  car?: Car;
}

export interface AuthResponse {
  sanitizedUser: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}
