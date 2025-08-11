// 'use client';

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useUser } from '@clerk/nextjs';
// import { api } from '~/trpc/react';

// type Notification = {
//   id: string;
//   message: string;
//   type: string; // e.g. 'ticket_created'
//   createdAt: string;
// };

// type SocketContextType = {
//   socket: Socket | null;
//   notifications: Notification[];
// };

// const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   notifications: [],
// });

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const { user, isSignedIn } = useUser();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   const utils = api.useUtils(); // tRPC query invalidation

//   useEffect(() => {
//     if (!isSignedIn || !user) return;

//     // Connect to your Node.js server
//     const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
//       auth: { userId: user.id },
//     });

//     setSocket(s);

//     // Handle incoming notification events
//     s.on('notification', (notif: Notification) => {
//       setNotifications(prev => [notif, ...prev]);

//       // If it's a ticket event, refetch dashboard tickets
//       if (notif.type === 'ticket_created' || notif.type === 'ticket_updated') {
//         utils.dash.getComplainsEmp.invalidate();
//       }
//     });

//     return () => {
//       s.disconnect();
//     };
//   }, [isSignedIn, user, utils]);

//   return (
//     <SocketContext.Provider value={{ socket, notifications }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };
