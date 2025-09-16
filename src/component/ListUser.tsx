"use client";
import { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { fetchUsers, deleteUser, fetchUserById } from "../api/UserAPI/UserAPI";
import { User } from "../types/User";
import DeleteIcon from "./SVGIcon/DeleteIcon";
import RefreshIcon from "./SVGIcon/RefreshIcon";
import AnimatedLoader from "./SVGIcon/AnimatedLoader";
import CreateUser from "./CreateUser";

export default function ListUser() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<any | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [autoRefetchEnabled, setAutoRefetchEnabled] = useState(false);
  const [refetchInterval, setRefetchInterval] = useState(10); // in seconds
  const [refetchCountdown, setRefetchCountdown] = useState(10);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Countdown timer for auto refetch
  useEffect(() => {
    if (!autoRefetchEnabled) return;

    const interval = setInterval(() => {
      setRefetchCountdown((prev) => {
        if (prev <= 1) {
          return refetchInterval; // Reset to selected interval when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefetchEnabled, refetchInterval]);

  // Fetch users with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["users"],
    queryFn: ({ pageParam = 0 }) => fetchUsers(10, pageParam),
    getNextPageParam: (lastPage: any, pages: any) => {
      const totalFetched = pages.length * 10;
      return totalFetched < lastPage.total ? totalFetched : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache is kept in memory for 10 minutes
    refetchOnWindowFocus: true, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchInterval: autoRefetchEnabled ? refetchInterval * 1000 : false, // દરેક selected interval માં automatic refetch
    refetchIntervalInBackground: autoRefetchEnabled, // background માં પણ fetch થશે
  });

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Fetch single user query
  const {
    data: selectedUser,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ["user", selectedUserId],
    queryFn: () => fetchUserById(selectedUserId!),
    enabled: !!selectedUserId,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    mutationKey: ["deleteUser"],
    onSuccess: () => {
      // Invalidate and refetch users after successful deletion
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUserId(null); // Clear deleting state
      setToastMessage("User deleted successfully!"); // Show success toast

      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    },
    onError: () => {
      setDeletingUserId(null); // Clear deleting state on error
    },
  });

  const handleDeleteUser = (id: any) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setDeletingUserId(id); // Set the specific user being deleted
      deleteUserMutation.mutate(id);
    }
  };

  const handleRefresh = () => {
    refetch();
    setRefetchCountdown(refetchInterval); // Reset countdown after manual refresh
  };

  const toggleAutoRefetch = () => {
    setAutoRefetchEnabled(!autoRefetchEnabled);
    if (!autoRefetchEnabled) {
      setRefetchCountdown(refetchInterval); // Reset countdown when enabling
    }
  };

  const handleIntervalChange = (interval: number) => {
    setRefetchInterval(interval);
    setRefetchCountdown(interval); // Reset countdown to new interval
  };

  const handleUserNameClick = (userId: number) => {
    setSelectedUserId(userId);
    setShowUserForm(true);
  };

  const handleCloseForm = () => {
    setShowUserForm(false);
    setSelectedUserId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <AnimatedLoader
          size="large"
          variant="spinner"
          text="Loading users..."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">
          Error: {error?.message || "Failed to fetch users"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users List</h2>
        <div className="flex items-center gap-3">
          {/* Auto Refetch Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
            <div
              className={`w-2 h-2 rounded-full ${
                autoRefetchEnabled
                  ? "bg-green-500 animate-pulse"
                  : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {autoRefetchEnabled
                ? `Auto-refresh in ${refetchCountdown}s (${refetchInterval}s interval)`
                : "Auto-refresh OFF"}
            </span>
          </div>

          {/* Interval Selection Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 mr-2">Interval:</span>
            {[5, 10, 20, 30, 60].map((interval) => (
              <button
                key={interval}
                onClick={() => handleIntervalChange(interval)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  refetchInterval === interval
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {interval}s
              </button>
            ))}
          </div>

          {/* Toggle Auto Refetch Button */}
          <button
            onClick={toggleAutoRefetch}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-md transition-colors ${
              autoRefetchEnabled
                ? "bg-green-500 hover:bg-green-700 text-white"
                : "bg-gray-500 hover:bg-gray-700 text-white"
            }`}
          >
            {autoRefetchEnabled ? "⏸️ Pause" : "▶️ Start"} Auto-refresh
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <AnimatedLoader size="small" variant="spinner" />
            ) : (
              <RefreshIcon />
            )}
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.pages.map((page: any) =>
          page.users.map((user: User) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3
                  className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                  onClick={() => handleUserNameClick(user.id)}
                  title="Click to edit user"
                >
                  {user.username}
                </h3>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 p-1 rounded hover:bg-red-50 transition-colors"
                  disabled={deletingUserId === user.id}
                  title="Delete user"
                >
                  {deletingUserId === user.id ? (
                    <>
                      <DeleteIcon isAnimating={true} />
                    </>
                  ) : (
                    <>
                      <DeleteIcon isAnimating={false} />
                    </>
                  )}
                  {deletingUserId !== user.id}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Username:</span> {user.username}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {user.phone}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Address :</h4>
                <p className="text-sm text-gray-600">
                  {user.address.city}, {user.address.state}
                  <br />
                  {user.address.city}, {user.address.postalCode}
                  <br />
                  {user.address.country}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Infinite Scroll Loading Indicator */}
      {isFetchingNextPage && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2 text-blue-600">
            <AnimatedLoader size="small" variant="spinner" />
            <span>Loading more users...</span>
          </div>
        </div>
      )}

      {/* End of Data Indicator */}
      {!hasNextPage && data && data.pages.length > 0 && (
        <div className="mt-6 flex justify-center">
          <p className="text-gray-500 text-sm">No more users to load</p>
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isLoadingUser ? "Loading User..." : "Edit User"}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {isLoadingUser ? (
                <div className="flex justify-center items-center p-8">
                  <AnimatedLoader
                    size="medium"
                    variant="dots"
                    text="Loading user details..."
                  />
                </div>
              ) : isUserError ? (
                <div className="flex justify-center items-center p-8">
                  <div className="text-red-500">
                    Error:{" "}
                    {userError?.message || "Failed to fetch user details"}
                  </div>
                </div>
              ) : selectedUser ? (
                <CreateUser
                  userData={selectedUser}
                  onClose={handleCloseForm}
                  isEditMode={true}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4  z-50 animate-slide-in">
          <div className="bg-green-500 text-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* {isMounted && (
        <ReactQueryDevtools initialIsOpen={true} position="bottom" />
      )} */}
    </div>
  );
}
