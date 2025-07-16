// Notifications.jsx

import React, { useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationsAsRead } from '../features/notificationSlice';
import { useNavigate } from 'react-router-dom';

const NOTIFICATIONS_PER_PAGE = 2;

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pageStart, setPageStart] = useState(0); // index of the first item on the current page
  const dropdownRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, unreadCount } = useSelector((state) => state.notifications);

  // Fetch notifications once on mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // Close dropdown when clicked outside
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset paging whenever the dropdown opens
  useEffect(() => {
    if (isOpen) {
      setPageStart(0);
    }
  }, [isOpen]);

  const handleBellClick = () => {
    if (!isOpen && unreadCount > 0) {
      const unreadIds = items.filter((n) => !n.isRead).map((n) => n._id);
      dispatch(markNotificationsAsRead(unreadIds));
    }
    setIsOpen((prev) => !prev);
  };

  const handleNotificationClick = (notification) => {
    if (notification.referenceId) {
      navigate(`/tasks/${notification.referenceId}`);
    }
    setIsOpen(false);
  };

  // Pagination helpers
  const paginatedItems = items.slice(pageStart, pageStart + NOTIFICATIONS_PER_PAGE);
  const hasNextPage = pageStart + NOTIFICATIONS_PER_PAGE < items.length;
  const hasPrevPage = items.length > NOTIFICATIONS_PER_PAGE; // show when more than one page exists

  const handleNext = () => {
    const nextStart = pageStart + NOTIFICATIONS_PER_PAGE;
    setPageStart(nextStart >= items.length ? 0 : nextStart); // cycle back to start
  };

  const handlePrev = () => {
    const prevStart = pageStart - NOTIFICATIONS_PER_PAGE;
    if (prevStart < 0) {
      // jump to last full or partial page
      const remainder = items.length % NOTIFICATIONS_PER_PAGE;
      const lastPageStart = remainder === 0 ? items.length - NOTIFICATIONS_PER_PAGE : items.length - remainder;
      setPageStart(Math.max(0, lastPageStart));
    } else {
      setPageStart(prevStart);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleBellClick} className="relative text-blue-600 hover:text-blue-800">
        <FaBell className="text-3xl sm:text-3xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed right-4 top-12 w-80 max-h-96 bg-white shadow-lg rounded-lg z-[9999]">
          {items.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No notifications</div>
          ) : (
            <>
              {paginatedItems.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-3 py-1 border-b cursor-pointer hover:bg-gray-100 ${
                    notification.isRead ? 'bg-white' : 'bg-gray-50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}

              {/* Paging controls */}
              {hasPrevPage && (
                <div className="flex divide-x">
                  <button
                    onClick={handlePrev}
                    className="w-1/2 text-md py-1 font-semibold text-blue-600 hover:bg-gray-100"
                  >
                    &laquo;
                  </button>
                  {hasNextPage && (
                    <button
                      onClick={handleNext}
                      className="w-1/2 text-md py-1 font-semibold text-blue-600 hover:bg-gray-100"
                    >
                      &raquo;
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
