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
  const [paginationMode, setPaginationMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

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

  // Fetch users with infinite query (for infinite scroll mode)
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isLoading: infiniteLoading,
    isFetchingNextPage,
    refetch: infiniteRefetch,
    isError: infiniteError,
    error: infiniteErrorMsg,
  } = useInfiniteQuery({
    queryKey: ["users", "infinite"],
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
    refetchInterval:
      autoRefetchEnabled && !paginationMode ? refetchInterval * 1000 : false, // દરેક selected interval માં automatic refetch
    refetchIntervalInBackground: autoRefetchEnabled && !paginationMode, // background માં પણ fetch થશે
    enabled: !paginationMode, // Only enable when not in pagination mode
  });

  // Fetch users with regular query (for pagination mode)
  const {
    data: paginatedData,
    isLoading: paginatedLoading,
    refetch: paginatedRefetch,
    isError: paginatedError,
    error: paginatedErrorMsg,
  } = useQuery({
    queryKey: ["users", "paginated", currentPage],
    queryFn: () => fetchUsers(10, currentPage),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    refetchInterval:
      autoRefetchEnabled && paginationMode ? refetchInterval * 1000 : false,
    refetchIntervalInBackground: autoRefetchEnabled && paginationMode,
    enabled: paginationMode, // Only enable when in pagination mode
  });

  // Use appropriate data based on mode
  const data = paginationMode ? paginatedData : infiniteData;
  const isLoading = paginationMode ? paginatedLoading : infiniteLoading;
  const isError = paginationMode ? paginatedError : infiniteError;
  const error = paginationMode ? paginatedErrorMsg : infiniteErrorMsg;
  const refetch = paginationMode ? paginatedRefetch : infiniteRefetch;

  // Infinite scroll effect (only when not in pagination mode)
  useEffect(() => {
    if (paginationMode) return; // Don't add scroll listener in pagination mode

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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, paginationMode]);

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

  const togglePaginationMode = () => {
    setPaginationMode(!paginationMode);
    setCurrentPage(0); // Reset to first page when switching modes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate pagination info
  const totalPages = data ? Math.ceil(data.total / 10) : 0;
  const currentPageDisplay = currentPage + 1;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Users Dashboard
                </h1>
                <p className="text-gray-500 text-sm">
                  Manage your users efficiently
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={togglePaginationMode}
                className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all duration-200 shadow-lg ${
                  paginationMode
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-purple-500/25"
                    : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                }`}
              >
                {paginationMode ? "📄 Pagination" : "♾️ Infinite Scroll"}
              </button>

              {/* Auto Refetch Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    autoRefetchEnabled
                      ? "bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"
                      : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {autoRefetchEnabled
                    ? `Auto-refresh in ${refetchCountdown}s`
                    : "Auto-refresh OFF"}
                </span>
              </div>

              {/* Interval Selection Buttons */}
              <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
                <span className="text-xs font-semibold text-gray-600 px-2">
                  Interval:
                </span>
                {[5, 10, 20, 30, 60].map((interval) => (
                  <button
                    key={interval}
                    onClick={() => handleIntervalChange(interval)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      refetchInterval === interval
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-gray-600 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    {interval}s
                  </button>
                ))}
              </div>

              {/* Toggle Auto Refetch Button */}
              <button
                onClick={toggleAutoRefetch}
                className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl transition-all duration-200 shadow-lg ${
                  autoRefetchEnabled
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/25"
                    : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                }`}
              >
                {autoRefetchEnabled ? "⏸️ Pause" : "▶️ Start"} Auto-refresh
              </button>

              {/* Manual Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25"
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
        </div>
        {/* Users Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginationMode
            ? // Pagination mode - single page data
              data?.users?.map((user: User) => (
                <div
                  key={user.id}
                  className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/90"
                >
                  {/* User Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3
                          className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors group-hover:scale-105"
                          onClick={() => handleUserNameClick(user.id)}
                          title="Click to edit user"
                        >
                          {user.username}
                        </h3>
                        <p className="text-xs text-gray-500">
                          User ID: {user.id}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20"
                      disabled={deletingUserId === user.id}
                      title="Delete user"
                    >
                      {deletingUserId === user.id ? (
                        <DeleteIcon isAnimating={true} />
                      ) : (
                        <DeleteIcon isAnimating={false} />
                      )}
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Username
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {user.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Email
                        </p>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Phone
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {user.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-700 text-sm">
                        Address
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {user.address.city}, {user.address.state}
                      <br />
                      {user.address.postalCode}
                      <br />
                      <span className="font-medium">
                        {user.address.country}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            : // Infinite scroll mode - multiple pages data
              data?.pages.map((page: any) =>
                page.users.map((user: User) => (
                  <div
                    key={user.id}
                    className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/90"
                  >
                    {/* User Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3
                            className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors group-hover:scale-105"
                            onClick={() => handleUserNameClick(user.id)}
                            title="Click to edit user"
                          >
                            {user.username}
                          </h3>
                          <p className="text-xs text-gray-500">
                            User ID: {user.id}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-red-500/20"
                        disabled={deletingUserId === user.id}
                        title="Delete user"
                      >
                        {deletingUserId === user.id ? (
                          <DeleteIcon isAnimating={true} />
                        ) : (
                          <DeleteIcon isAnimating={false} />
                        )}
                      </button>
                    </div>

                    {/* User Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Username
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {user.username}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Email
                          </p>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Phone
                          </p>
                          <p className="text-sm font-medium text-gray-800">
                            {user.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-700 text-sm">
                          Address
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {user.address.city}, {user.address.state}
                        <br />
                        {user.address.postalCode}
                        <br />
                        <span className="font-medium">
                          {user.address.country}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              )}
        </div>

        {/* Pagination Controls - Only show when pagination mode is enabled */}
        {paginationMode && data && totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-4">
                {/* Page Info */}
                <div className="text-sm text-gray-600 font-medium">
                  Page {currentPageDisplay} of {totalPages}
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    ⏮️
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    ◀️
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                            : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}

                  {/* Next Page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    ▶️
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    ⏭️
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infinite Scroll Loading Indicator - Only show when not in pagination mode */}
        {!paginationMode && isFetchingNextPage && (
          <div className="mt-12 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 px-8 py-4 flex items-center gap-3">
              <AnimatedLoader size="small" variant="spinner" />
              <span className="text-gray-700 font-medium">
                Loading more users...
              </span>
            </div>
          </div>
        )}

        {/* End of Data Indicator - Only show when not in pagination mode */}
        {!paginationMode && !hasNextPage && data && data.pages.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl px-8 py-4 border border-gray-200">
              <p className="text-gray-600 font-medium flex items-center gap-2">
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
                All users loaded
              </p>
            </div>
          </div>
        )}
      </div>

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

      {/* Enhanced Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-400/20 flex items-center gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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
            </div>
            <div>
              <p className="font-semibold text-sm">Success!</p>
              <p className="text-xs opacity-90">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
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
