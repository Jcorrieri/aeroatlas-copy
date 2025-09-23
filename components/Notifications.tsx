"use client";

import React, { useEffect } from 'react';

interface NotificationProps {
    visible: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
    onClose?: () => void;
    autoClose?: boolean;
    autoCloseTime?: number;
}

/**
 * Notification component for displaying toast-style messages
 *
 * @param visible - Whether the notification is visible
 * @param message - The message to display
 * @param type - The type of notification (success, error, info, warning)
 * @param onClose - Function to call when the notification is closed
 * @param autoClose - Whether to automatically close the notification
 * @param autoCloseTime - Time in milliseconds before auto-closing (default: 3000)
 */
const Notification: React.FC<NotificationProps> = ({
                                                       visible,
                                                       message,
                                                       type = "info",
                                                       onClose,
                                                       autoClose = true,
                                                       autoCloseTime = 3000
                                                   }) => {
    // Auto-close functionality
    useEffect(() => {
        if (visible && autoClose) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, autoCloseTime);

            return () => clearTimeout(timer);
        }
    }, [visible, autoClose, autoCloseTime, onClose]);

    if (!visible) return null;

    // Determine background color based on notification type
    const getBgColor = () => {
        switch (type) {
            case "success":
                return "bg-green-500 dark:bg-green-600";
            case "error":
                return "bg-red-500 dark:bg-red-600";
            case "warning":
                return "bg-amber-500 dark:bg-amber-600";
            case "info":
            default:
                return "bg-blue-500 dark:bg-blue-600";
        }
    };

    // Get icon based on type
    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                );
            case "error":
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                    </svg>
                );
            case "warning":
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                );
            case "info":
            default:
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                );
        }
    };

    return (
        <div className={`fixed bottom-20 right-6 p-3 rounded-lg shadow-lg z-50 transition-all duration-300 
                      ${getBgColor()} text-white max-w-xs opacity-95 animate-fade-in-up`}>
            <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="flex-grow">
                    {message}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors"
                        aria-label="Close notification"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Notification;