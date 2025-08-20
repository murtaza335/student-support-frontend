'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { api } from '~/trpc/react';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '~/types/notifications/Notification';
import { useUser } from '@clerk/nextjs';

const NotificationsComponent = () => {
  const { user } = useUser();
  const [shouldFetchNotifications, setShouldFetchNotifications] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [notificationOffset, setNotificationOffset] = useState(0);
  const notificationRef = useRef(null);
  
  // Swipe and scroll lock states
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragThreshold] = useState(100);
  const panelRef = useRef<HTMLDivElement>(null);

  // API calls
  const { data: getNotificationsResponse } = api.notifications.getNotifications.useQuery({
    offset: notificationOffset,
  }, { enabled: shouldFetchNotifications });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { mutate: markNotificationAsRead } = api.notifications.markNotificationAsRead.useMutation();
  const { mutate: markAllNotificationsAsRead } = api.notifications.markAllNotificationsAsRead.useMutation();

  // Scroll lock effect - Only apply on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    
    if (isNotificationOpen && isMobile) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isNotificationOpen]);

  // Touch event handlers for swipe down (mobile only)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 640) return;
    setStartY(e.touches[0]!.clientY);
    setCurrentY(e.touches[0]!.clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || window.innerWidth >= 640) return;
    
    const touch = e.touches[0]!;
    setCurrentY(touch.clientY);
    
    const deltaY = touch.clientY - startY;
    
    const scrollContainer = panelRef.current?.querySelector('.overflow-y-auto');
    const isAtTop = scrollContainer?.scrollTop === 0;
    
    if (deltaY > 0 && isAtTop) {
      e.preventDefault();
      
      if (panelRef.current) {
        const translateY = Math.min(deltaY * 0.5, 200);
        panelRef.current.style.transform = `translateY(${translateY}px)`;
        panelRef.current.style.transition = 'none';
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || window.innerWidth >= 640) return;
    
    const deltaY = currentY - startY;
    
    if (panelRef.current) {
      panelRef.current.style.transform = '';
      panelRef.current.style.transition = '';
    }
    
    if (deltaY > dragThreshold) {
      setIsNotificationOpen(false);
    }
    
    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  // Initialize notifications fetching
  useEffect(() => {
    if (user) {
      setShouldFetchNotifications(true);
    }
  }, [user]);

  // Handle notifications data
  useEffect(() => {
    const rawData = getNotificationsResponse;
    if (!rawData) return;

    const rawNotifications = rawData.notifications || [];
    const transformed: Notification[] = (rawNotifications).map((notif: Notification): Notification => ({
      ...notif,
      isRead: notif.isRead ?? false,
    }));

    if (transformed.length > 0) {
      setNotifications((prev) => [...prev, ...transformed]);
    }

    if (rawData.pagination?.offset !== undefined) {
      setNotificationOffset(rawData.pagination.offset);
    }

    setHasMore(rawData.pagination?.hasMore ?? false);

    if (rawData.totalUnread !== undefined) {
      setTotalUnread(Number(rawData.totalUnread));
    }
  }, [getNotificationsResponse]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !(notificationRef.current as HTMLDivElement).contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notification actions
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
    markNotificationAsRead({ id });
    setTotalUnread((prev) => Math.max(prev - 1, 0));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    markAllNotificationsAsRead();
    setTotalUnread(0);
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== id)
    );
  };

  // Don't render if user doesn't have permission
  if (!user || !['manager', 'employee', 'worker', 'admin'].includes(user.publicMetadata.role as string)) {
    return null;
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Bell className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <>
          {/* Mobile: Full screen overlay with solid background */}
          <div 
            className="fixed inset-0 bg-gray-800 z-40 sm:hidden" 
            onClick={() => setIsNotificationOpen(false)}
          />
          
          {/* Notification Panel */}
          <div 
            ref={panelRef}
            className={`
              fixed sm:absolute
              bottom-0 sm:top-full sm:mt-2
              left-0 sm:left-auto sm:right-0
              w-full sm:w-96
              max-h-[85vh] sm:max-h-96
              bg-white 
              rounded-t-2xl sm:rounded-lg 
              shadow-2xl sm:shadow-xl 
              border-t-2 sm:border-2 border-gray-200
              transform transition-transform duration-300 ease-out
              ${isDragging ? '' : 'transition-transform'}
            `}
            style={{ 
              zIndex: 9999,
              backgroundColor: '#ffffff',
              touchAction: window.innerWidth < 640 ? 'pan-y' : 'auto'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            
            {/* Mobile Handle - Only show on mobile */}
            <div 
              className="block sm:hidden w-12 h-1 bg-gray-400 rounded-full mx-auto mt-3 mb-2 cursor-grab active:cursor-grabbing"
              style={{
                backgroundColor: isDragging ? '#6b7280' : '#9ca3af',
                transition: isDragging ? 'none' : 'background-color 0.2s'
              }}
            />
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-2xl sm:rounded-t-lg">
              <div className="flex items-center gap-3">
                <h3 className="text-lg sm:text-base font-semibold text-gray-900">Notifications</h3>
                {totalUnread > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                    {totalUnread} new
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <span className="hidden sm:inline">Mark all as read</span>
                    <span className="sm:hidden">Mark all</span>
                  </button>
                )}
                
                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="block sm:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div 
              className="overflow-y-auto bg-white" 
              style={{ 
                maxHeight: window.innerWidth < 640 ? 'calc(85vh - 120px)' : '300px',
              }}
            >
              {notifications.length === 0 ? (
                <div className="px-4 py-12 sm:py-8 text-center text-gray-500 bg-white">
                  <Bell className="w-12 h-12 sm:w-8 sm:h-8 text-gray-300 mx-auto mb-3 sm:mb-2" />
                  <p className="text-base sm:text-sm font-medium mb-1">No notifications</p>
                  <p className="text-sm sm:text-xs text-gray-400">You&apos;re all caught up!</p>
                  <p className="text-xs text-gray-400 mt-2 sm:hidden">Swipe down to close</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 bg-white">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-4 sm:py-3 hover:bg-gray-50 transition-colors duration-150 border-l-4 ${
                        !notification.isRead 
                          ? 'bg-blue-50 border-l-blue-500' 
                          : 'bg-white border-l-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Notification dot */}
                        {!notification.isRead && (
                          <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full mt-2 sm:mt-1.5 flex-shrink-0" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className={`text-base sm:text-sm font-medium leading-5 ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                New Notification
                              </p>
                              <p className="text-sm text-gray-600 mt-1 leading-5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2 sm:mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-2 sm:p-1 hover:bg-gray-200 rounded-lg sm:rounded text-gray-500 hover:text-green-600 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4 sm:w-3 sm:h-3" />
                                </button>
                              )}

                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-2 sm:p-1 hover:bg-gray-200 rounded-lg sm:rounded text-gray-500 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <X className="w-4 h-4 sm:w-3 sm:h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 bg-gray-100 border-t border-gray-200 rounded-b-2xl sm:rounded-b-lg">
                {hasMore ? (
                  <button
                    onClick={() => setNotificationOffset((prev) => prev + 10)}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 sm:py-1 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Load More
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-center py-2 sm:py-1">
                    <p className="text-sm text-gray-500">No more notifications</p>
                    <p className="text-xs text-gray-400 mt-1 sm:hidden">Swipe down to close</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsComponent;