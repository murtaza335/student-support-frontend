'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { api } from '~/trpc/react';
// import { useToast } from './ToastProvider';

type BackendNotification = {
    type: string; // e.g., "COMPLAINT_CREATED"
    action: string; // e.g., "CREATE", "UPDATE"
    data: any;
    timestamp: string;
};

type SocketContextType = {
    socket: Socket | null;
    notifications: BackendNotification[];
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    notifications: [],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, isSignedIn } = useUser();
    const role = user?.publicMetadata.role;
    const teamId = user?.publicMetadata.teamId;
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<BackendNotification[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    //   const { addToast } = useToast();
    const utils = api.useUtils();

    // Socket configuration
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://624781354803.ngrok-free.app';
    const SOCKET_ENABLED = process.env.NEXT_PUBLIC_SOCKET_ENABLED !== 'false';

    useEffect(() => {
        console.log('🔄 NotificationProvider useEffect triggered', {
            isSignedIn,
            userId: user?.id,
            userEmail: user?.emailAddresses?.[0]?.emailAddress,
            socketEnabled: SOCKET_ENABLED,
            socketUrl: SOCKET_URL
        });

        if (!SOCKET_ENABLED) {
            console.log('🔇 Socket connection disabled via environment variable');
            return;
        }

        if (!isSignedIn || !user) {
            console.log('❌ User not signed in or user object missing', { isSignedIn, user: !!user });
            return;
        }

        console.log('🚀 Attempting to connect to socket...', {
            socketUrl: SOCKET_URL,
            userId: user.id
        });

        setConnectionStatus('connecting');

        const s = io(SOCKET_URL, {
            auth: { userId: user.id },
            timeout: 20000, // 20 second timeout
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            forceNew: true,
            autoConnect: true,
            transports: ['websocket', 'polling'],
        });

        console.log('📡 Socket instance created', { socketId: s.id });

        // Add connection event listeners
        s.on('connect', () => {
            setConnectionStatus('connected');
            console.log('✅ Socket connected successfully', {
                socketId: s.id,
                userId: user.id,
                timestamp: new Date().toISOString(),
                connected: s.connected,
                transport: s.io.engine?.transport?.name
            });

            const payload = {
                userId: user.id,
                teamIds: Array.isArray(teamId) ? teamId : teamId ? [teamId] : [],
                role: role
            };

            s.emit('subscribeWithRole', payload);

            console.log('🚪 Subscribing with role payload:', {
                ...payload,
                socketId: s.id
            });
        });

        s.on('connect_error', (error) => {
            setConnectionStatus('error');
            console.error('❌ Socket connection error:', {
                error: error.message,
                stack: error.stack,
                userId: user.id,
                timestamp: new Date().toISOString(),
                errorName: error.name,
                socketConnected: s.connected
            });

            // Log specific error types
            if (error.message === 'server error') {
                console.error('🚨 Server Error Details:', {
                    possibleCauses: [
                        'Backend server is not running',
                        'ngrok tunnel has expired or changed',
                        'Server is rejecting the connection',
                        'CORS issues',
                        'Authentication issues'
                    ],
                    troubleshooting: [
                        'Check if backend server is running',
                        'Verify ngrok URL is correct and active',
                        'Check server logs for errors',
                        'Verify userId is being sent correctly'
                    ],
                    currentUserId: user.id,
                    socketUrl: SOCKET_URL,
                    nextSteps: [
                        '1. Verify the backend server is running',
                        '2. Check if ngrok tunnel is active and hasn\'t expired',
                        '3. Update SOCKET_URL if ngrok URL changed',
                        '4. Check server logs for connection errors',
                        '5. Temporarily disable socket by setting NEXT_PUBLIC_SOCKET_ENABLED=false'
                    ]
                });
            }
        });

        s.on('disconnect', (reason) => {
            setConnectionStatus('disconnected');
            console.log('🔌 Socket disconnected', {
                reason,
                socketId: s.id,
                userId: user.id,
                timestamp: new Date().toISOString(),
                willReconnect: reason !== 'io client disconnect'
            });
        });

        // Add reconnection attempt logging
        s.on('reconnect_attempt', (attempt) => {
            setConnectionStatus('connecting');
            console.log('🔄 Reconnection attempt', {
                attempt,
                userId: user.id,
                timestamp: new Date().toISOString()
            });
        });

        s.on('reconnect', (attempt) => {
            setConnectionStatus('connected');
            console.log('🎉 Reconnected successfully', {
                attempt,
                socketId: s.id,
                userId: user.id,
                timestamp: new Date().toISOString()
            });

            // Rejoin room after reconnection
            const roomId = user.id;
            s.emit('joinRoom', { room: roomId });
            console.log('🚪 Rejoining room after reconnection:', {
                roomId,
                userId: user.id,
                socketId: s.id,
                timestamp: new Date().toISOString()
            });
        });

        s.on('reconnect_error', (error) => {
            setConnectionStatus('error');
            console.error('❌ Reconnection error:', {
                error: error.message,
                userId: user.id,
                timestamp: new Date().toISOString()
            });
        });

        s.on('reconnect_failed', () => {
            setConnectionStatus('error');
            console.error('💥 Reconnection failed - giving up', {
                userId: user.id,
                timestamp: new Date().toISOString(),
                message: 'All reconnection attempts exhausted'
            });
        });

        // Room join event listeners
        s.on('roomJoined', (data) => {
            console.log('✅ Successfully joined room:', {
                room: data.room,
                userId: user.id,
                socketId: s.id,
                timestamp: new Date().toISOString(),
                message: data.message || 'Room joined successfully'
            });
        });

        s.on('roomJoinError', (error) => {
            console.error('❌ Failed to join room:', {
                error: error.message || error,
                room: error.room,
                userId: user.id,
                socketId: s.id,
                timestamp: new Date().toISOString()
            });
        });

        setSocket(s);

        s.on('complaint_notification', (notif: BackendNotification) => {

            console.log('🔔 Processing notification', notif);
            console.log('📩 Received notification:', {
                type: notif.type,
                action: notif.action,
                data: notif.data,
                timestamp: notif.timestamp,
                complaintId: notif.data?.id,
                complaintTitle: notif.data?.title,
                receivedAt: new Date().toISOString(),
                userId: user.id
            });

            console.log('📊 Current notifications count before adding:', notifications.length);

            setNotifications(prev => {
                const updated = [notif, ...prev];
                console.log('📊 Updated notifications count:', updated.length);
                return updated;
            });

            const complaintId = notif.data?.id;
            console.log('🔍 Processing notification type:', notif.type, { complaintId });

            switch (notif.type) {
                case 'COMPLAINT_CREATED':
                    console.log('🆕 Processing COMPLAINT_CREATED:', {
                        complaintId,
                        title: notif.data?.title,
                        invalidatingQueries: ['dash.getComplainsEmp', 'managerDash.getTeamComplaints']
                    });
                    utils.dash.getComplainsEmp.invalidate();
                    utils.managerDash.getTeamComplaints.invalidate();
                    console.log('✅ COMPLAINT_CREATED invalidations completed');
                    break;

                case 'COMPLAINT_ASSIGNED':
                    console.log('📋 Processing COMPLAINT_ASSIGNED:', {
                        complaintId,
                        title: notif.data?.title,
                        invalidatingQueries: ['workerDash.getWorkerTickets', 'dash.getComplainsEmp', 'managerDash.getTeamComplaints', 'complaints.getComplainInfo']
                    });
                    utils.workerDash.getWorkerTickets.invalidate();
                    utils.dash.getComplainsEmp.invalidate();
                    utils.managerDash.getTeamComplaints.invalidate();
                    if (complaintId) {
                        utils.complaints.getComplainInfo.invalidate({ id: complaintId });
                        console.log('✅ COMPLAINT_ASSIGNED invalidations completed including specific complaint:', complaintId);
                    } else {
                        console.log('✅ COMPLAINT_ASSIGNED invalidations completed (no specific complaint ID)');
                    }
                    break;

                case 'COMPLAINT_RESOLVED':
                    console.log('✅ Processing COMPLAINT_RESOLVED:', {
                        complaintId,
                        title: notif.data?.title,
                        invalidatingQueries: ['workerDash.getWorkerTickets', 'managerDash.getTeamComplaints', 'complaints.getComplainInfo']
                    });
                    utils.workerDash.getWorkerTickets.invalidate();
                    utils.managerDash.getTeamComplaints.invalidate();
                    if (complaintId) {
                        utils.complaints.getComplainInfo.invalidate({ id: complaintId });
                        console.log('✅ COMPLAINT_RESOLVED invalidations completed including specific complaint:', complaintId);
                    } else {
                        console.log('✅ COMPLAINT_RESOLVED invalidations completed (no specific complaint ID)');
                    }
                    break;

                case 'COMPLAINT_CLOSED':
                    console.log('🔒 Processing COMPLAINT_CLOSED:', {
                        complaintId,
                        title: notif.data?.title,
                        invalidatingQueries: ['managerDash.getTeamComplaints', 'workerDash.getWorkerTickets', 'complaints.getComplainInfo']
                    });
                    utils.managerDash.getTeamComplaints.invalidate();
                    utils.workerDash.getWorkerTickets.invalidate();
                    if (complaintId) {
                        utils.complaints.getComplainInfo.invalidate({ id: complaintId });
                        console.log('✅ COMPLAINT_CLOSED invalidations completed including specific complaint:', complaintId);
                    } else {
                        console.log('✅ COMPLAINT_CLOSED invalidations completed (no specific complaint ID)');
                    }
                    break;

                case 'COMPLAINT_REOPENED':
                    console.log('🔄 Processing COMPLAINT_REOPENED:', {
                        complaintId,
                        title: notif.data?.title,
                        invalidatingQueries: ['dash.getComplainsEmp', 'managerDash.getTeamComplaints', 'complaints.getComplainInfo']
                    });
                    utils.dash.getComplainsEmp.invalidate();
                    utils.managerDash.getTeamComplaints.invalidate();
                    if (complaintId) {
                        utils.complaints.getComplainInfo.invalidate({ id: complaintId });
                        console.log('✅ COMPLAINT_REOPENED invalidations completed including specific complaint:', complaintId);
                    } else {
                        console.log('✅ COMPLAINT_REOPENED invalidations completed (no specific complaint ID)');
                    }
                    break;

                case 'COMMENT_ADDED':
                    console.log('💬 Processing COMMENT_ADDED:', {
                        complaintId,
                        commentData: notif.data,
                        invalidatingQueries: ['complaints.getComplainInfo']
                    });
                    if (complaintId) {
                        utils.complaints.getComplainInfo.invalidate({ id: complaintId });
                        console.log('✅ COMMENT_ADDED invalidations completed for complaint:', complaintId);
                    } else {
                        console.log('⚠️ COMMENT_ADDED: No complaint ID provided');
                    }
                    break;

                case 'FEEDBACK_SUBMITTED':
                    console.log('⭐ Processing FEEDBACK_SUBMITTED:', {
                        complaintId,
                        feedbackData: notif.data,
                        invalidatingQueries: ['complaints.getComplainInfo']
                    });
                    if (complaintId) {
                        utils.complaints.getComplainInfo.invalidate({ id: complaintId });
                        console.log('✅ FEEDBACK_SUBMITTED invalidations completed for complaint:', complaintId);
                    } else {
                        console.log('⚠️ FEEDBACK_SUBMITTED: No complaint ID provided');
                    }
                    break;

                default:
                    console.warn('⚠️ Unhandled notification type:', {
                        type: notif.type,
                        action: notif.action,
                        data: notif.data,
                        timestamp: notif.timestamp,
                        availableTypes: ['COMPLAINT_CREATED', 'COMPLAINT_ASSIGNED', 'COMPLAINT_RESOLVED', 'COMPLAINT_CLOSED', 'COMPLAINT_REOPENED', 'COMMENT_ADDED', 'FEEDBACK_SUBMITTED']
                    });
            }

            console.log('🏁 Notification processing completed for type:', notif.type);
        });

        return () => {
            console.log('🧹 Cleaning up socket connection', {
                socketId: s.id,
                userId: user.id,
                timestamp: new Date().toISOString()
            });
            setConnectionStatus('disconnected');
            s.disconnect();
            console.log('🔌 Socket disconnected in cleanup');
        };
    }, [isSignedIn, user, utils]);

    console.log('🔄 NotificationProvider render', {
        socketConnected: socket?.connected,
        socketId: socket?.id,
        notificationsCount: notifications.length,
        userId: user?.id,
        isSignedIn,
        connectionStatus
    });

    return (
        <SocketContext.Provider value={{ socket, notifications }}>
            {children}
        </SocketContext.Provider>
    );
};
