"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser } from "../api/UserAPI/UserAPI";
import { CreateUserData, User } from "../types/User";
import AnimatedLoader from "./SVGIcon/AnimatedLoader";

interface CreateUserProps {
  userData?: User;
  onClose?: () => void;
  isEditMode?: boolean;
}

export default function CreateUser({
  userData,
  onClose,
  isEditMode = false,
}: CreateUserProps) {
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    address: {
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    phone: "",
  });

  // Populate form when userData is provided
  useEffect(() => {
    if (userData && isEditMode) {
      setFormData({
        username: userData.username,
        email: userData.email,
        address: {
          city: userData.address.city,
          state: userData.address.state,
          postalCode: userData.address.postalCode,
          country: userData.address.country,
        },
        phone: userData.phone,
      });
      setIsFormVisible(true);
    }
  }, [userData, isEditMode]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: createUser,
    mutationKey: ["createUser"],
    onSuccess: () => {
      // Invalidate and refetch users after successful creation
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Reset form
      setFormData({
        username: "",
        email: "",
        address: {
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        phone: "",
      });
      setIsFormVisible(false);
      alert("User created successfully!");
    },
    onError: (error) => {
      alert(`Error creating user: ${error.message}`);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: any; data: CreateUserData }) =>
      updateUser(id, data),
    onSuccess: () => {
      // Invalidate and refetch users after successful update
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Reset form
      setFormData({
        username: "",
        email: "",
        address: {
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        phone: "",
      });
      setIsFormVisible(false);
      if (onClose) onClose();
      alert("User updated successfully!");
    },
    onError: (error) => {
      alert(`Error updating user: ${error.message}`);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle nested object properties (like address.street)
    if (name.includes(".")) {
      const [parentKey, childKey] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey as keyof CreateUserData],
          [childKey]: value,
        },
      }));
    } else {
      // Handle top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic fields validation
    if (!formData.username.trim()) newErrors.username = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isEditMode && userData) {
        updateUserMutation.mutate({ id: userData.id, data: formData });
      } else {
        createUserMutation.mutate(formData);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        {!isEditMode && (
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isFormVisible ? "Hide Form" : "Add New User"}
          </button>
        )}
      </div>

      {isFormVisible && (
        <div
          className={`rounded-lg shadow-md p-6 border mb-6 relative ${
            isEditMode
              ? "bg-blue-50 border-blue-200"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Loading Overlay */}
          {(createUserMutation.isPending || updateUserMutation.isPending) && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <AnimatedLoader
                size="large"
                variant="spinner"
                text={isEditMode ? "Updating user..." : "Creating user..."}
              />
            </div>
          )}
          <h3 className="text-lg font-semibold mb-4 text-black">
            {isEditMode ? "Edit User" : "Create New User"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                    errors.username
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div> */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-black mb-3">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                      errors["address.street"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors["address.street"] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors["address.street"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                      errors["address.suite"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors["address.suite"] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors["address.suite"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                      errors["address.city"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors["address.city"] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors["address.city"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Zipcode
                  </label>
                  <input
                    type="text"
                    name="address.zipcode"
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                      errors["address.zipcode"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors["address.zipcode"] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors["address.zipcode"]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* <div className="border-t pt-4">
              <h4 className="text-md font-medium text-black mb-3">Company</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company.name"
                    value={formData.company.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                      errors["company.name"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors["company.name"] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors["company.name"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Catch Phrase
                  </label>
                  <input
                    type="text"
                    name="company.catchPhrase"
                    value={formData.company.catchPhrase}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                      errors["company.catchPhrase"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors["company.catchPhrase"] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors["company.catchPhrase"]}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">
                    Business Strategy
                  </label>
                  <input
                    type="text"
                    name="company.bs"
                    value={formData.company.bs}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-black border rounded-md focus:outline-none focus:ring-2 ${
                      errors["company.bs"]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors["company.bs"] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors["company.bs"]}
                    </p>
                  )}
                </div>
              </div>
            </div> */}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (isEditMode && onClose) {
                    onClose();
                  } else {
                    setIsFormVisible(false);
                  }
                }}
                className="px-4 py-2 text-black bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createUserMutation.isPending || updateUserMutation.isPending
                }
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                {(createUserMutation.isPending ||
                  updateUserMutation.isPending) && (
                  <AnimatedLoader
                    size="small"
                    variant="bounce"
                    color="#FFFFFF"
                  />
                )}
                {createUserMutation.isPending
                  ? "Creating..."
                  : updateUserMutation.isPending
                  ? "Updating..."
                  : isEditMode
                  ? "Update User"
                  : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
