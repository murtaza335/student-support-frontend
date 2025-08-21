'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@clerk/nextjs';
import { api } from '~/trpc/react'; // 👈 for invalidation
import { useToast } from './ToastProvider';

type BackendNotification = {
  type: string;
  message: string;
  complaintId?: string | undefined;
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
  const { addToast } = useToast();
  const { user, isSignedIn } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const utils = api.useUtils();

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch((err) => {
  // Ignore playback errors (e.g., user gesture required)
});
  };

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const s = io(SOCKET_URL, { transports: ['websocket'] });

    s.on('connect', () => {
      console.log('✅ Socket connected:', s.id);
      s.emit('registerUser', user.id);
      console.log('📡 Registered user:', user.id);
    });

    s.on('notification', async (notif: BackendNotification) => {
      console.log('🔔 Incoming notification:', notif);
      const { complaintId } = notif;

      await utils.notifications.getNotifications.invalidate();

      switch (notif.type) {
        case 'COMPLAINT_CREATED':
          addToast(notif.message, 'info', 'New Complaint Created');
          playNotificationSound();
          await utils.dash.getComplainsEmp.invalidate();
          await utils.managerDash.getTeamComplaints.invalidate();
          
          break;

        case 'COMPLAINT_ASSIGNED':
          addToast(notif.message, 'info', 'Complaint Assigned');
          await utils.workerDash.getWorkerTickets.invalidate();
          await utils.dash.getComplainsEmp.invalidate();
          await utils.managerDash.getTeamComplaints.invalidate();
          if (complaintId) {
            await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
            await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
          }
          break;

        case 'COMPLAINT_RESOLVED':
          addToast(notif.message, 'info', 'Complaint Resolved');
          await utils.workerDash.getWorkerTickets.invalidate();
          await utils.managerDash.getTeamComplaints.invalidate();
          if (complaintId) {
            await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
            await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
          }
          break;

        case 'COMPLAINT_CLOSED':
          addToast(notif.message, 'info', 'Complaint Closed');
          await utils.managerDash.getTeamComplaints.invalidate();
          await utils.workerDash.getWorkerTickets.invalidate();
          
          if (complaintId) {
            await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
            await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
          }
          break;

        case 'COMPLAINT_REOPENED':
          addToast(notif.message, 'info', 'Complaint Reopened');
          await utils.dash.getComplainsEmp.invalidate();
          await utils.managerDash.getTeamComplaints.invalidate();
          if (complaintId) {
            await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
            await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
          }
          break;

        case 'COMMENT_ADDED':
          addToast(notif.message, 'info', 'Comment Added');
          if (complaintId) {
            await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
            await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
          }
          break;

        case 'FEEDBACK_SUBMITTED':
          addToast(notif.message, 'info', 'Feedback Submitted');
          if (complaintId) {
            await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
            await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
          }
          break;

        case 'COMPLAINT_STATUS_CHANGED':
          addToast(notif.message, 'info', 'Complaint Status Changed');
          await utils.managerDash.getTeamComplaints.invalidate();
          await utils.workerDash.getWorkerTickets.invalidate();
          await utils.dash.getComplainsEmp.invalidate();
          if (complaintId) {
            await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
            await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
          }
          break;

        case 'WORKER_CHANGED':
            addToast(notif.message, 'info', 'Worker Changed');
            await utils.managerDash.getTeamComplaints.invalidate();
            await utils.workerDash.getWorkerTickets.invalidate();
            await utils.dash.getComplainsEmp.invalidate();
            if (complaintId) {
              await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
              await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
            }
            break;
        case 'COMPLAINT_FORWARDED':
            addToast(notif.message, 'info', 'Complaint Forwarded');
            await utils.managerDash.getTeamComplaints.invalidate();
            if (complaintId) {
              await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
              await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
            }
            break;
        case 'COMPLAINT_DELETED':
            addToast(notif.message, 'info', 'Complaint Deleted');
            await utils.managerDash.getTeamComplaints.invalidate();
            await utils.dash.getComplainsEmp.invalidate();
            if (complaintId) {
              await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
              await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
            }
            break;

        case 'COMPLAINT_ACTIVATED':
            addToast(notif.message, 'info', 'Complaint Activated');
            await utils.managerDash.getTeamComplaints.invalidate();
            await utils.dash.getComplainsEmp.invalidate();
            await utils.dash.getComplainsWorker.invalidate();
            if (complaintId) {
              await utils.complaints.getComplainInfo.invalidate({ id: complaintId });
              await utils.complaints.getComplaintLogs.invalidate({ complaintId: complaintId });
            }
            break;

        default:
          console.warn('⚠️ Unhandled notification type:', notif.type, notif);
      }
      

      // Save for UI
      setNotifications(prev => [notif, ...prev]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [isSignedIn, user, SOCKET_URL]);

  return (
    <SocketContext.Provider value={{ socket, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};
