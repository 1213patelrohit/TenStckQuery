export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  website: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  address: {
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
}
