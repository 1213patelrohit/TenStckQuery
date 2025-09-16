import { User, CreateUserData } from "../../types/User";

// const API_BASE_URL = "https://jsonplaceholder.typicode.com";
const API_BASE_URL = "https://dummyjson.com";

// Fetch all users
export async function fetchUsers(limit: number = 10, skip: number = 0) {
  const res = await fetch(`${API_BASE_URL}/users?limit=${limit}&skip=${skip}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// Fetch single user by ID
export const fetchUserById = async (id: number): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user with id ${id}`);
  }
  return response.json();
};

// Create new user
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error("Failed to create user");
  }
  return response.json();
};

// Update user
export const updateUser = async (
  id: number,
  userData: Partial<CreateUserData>
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update user with id ${id}`);
  }
  return response.json();
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete user with id ${id}`);
  }
};
