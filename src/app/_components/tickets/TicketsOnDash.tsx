'use client';

// this component contains the <TicketCategoryTabs> and <Ticket> components

import Ticket from "./Ticket";
import TicketCategoryTabs from "./TicketFilterBar";
import type { ticket } from "~/types/tickets/ticket";
import TicketSkeleton from "./TicketSkeletonLoading";
// import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useUser } from '@clerk/nextjs';

interface TicketsOnDashProps {
    tickets?: ticket[]; 
    isLoading?: boolean;
}

interface FilterState {
    priority: string;
    status: string;
    date: string;
    search: string;
}

const TicketsOnDash = ({ tickets, isLoading}: TicketsOnDashProps) => {
    // const Router = useRouter();
    const { user } = useUser();
    const role = user?.publicMetadata?.role ?? 'guest';
    
    // Filter state management
    const [filters, setFilters] = useState<FilterState>({
        priority: '',
        status: '',
        date: '',
        search: '',
    });

    // Filter and sort function
    const filteredTickets = useMemo(() => {
        if (!tickets) return [];

        // First apply filters
        const filtered = tickets.filter((ticket) => {
            // Priority filter
            if (filters.priority && ticket.priority !== filters.priority) {
                return false;
            }

            // Status filter
            if (filters.status && ticket.status !== filters.status) {
                return false;
            }

            // Date filter (filter by creation date)
            if (filters.date) {
                const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
                if (ticketDate !== filters.date) {
                    return false;
                }
            }

            // Search filter (search in title, ID, employee name)
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const titleMatch = ticket.title.toLowerCase().includes(searchTerm);
                const idMatch = ticket.id.toString().includes(searchTerm);
                const employeeMatch = ticket.employeeName.toLowerCase().includes(searchTerm);
                const categoryMatch = ticket.categoryName.toLowerCase().includes(searchTerm);
                const subCategoryMatch = ticket.subCategoryName.toLowerCase().includes(searchTerm);
                
                if (!titleMatch && !idMatch && !employeeMatch && !categoryMatch && !subCategoryMatch) {
                    return false;
                }
            }

            return true;
        });

        // Then sort based on role and priority actions
        return filtered.sort((a, b) => {
            // For workers: prioritize tickets that need activation (status: in_queue)
            if (role === 'worker') {
                const aNeedsActivation = a.status === 'in_queue';
                const bNeedsActivation = b.status === 'in_queue';
                
                if (aNeedsActivation && !bNeedsActivation) return -1;
                if (!aNeedsActivation && bNeedsActivation) return 1;
            }
            
            // For employees: prioritize tickets that need feedback (feedbackGiven: false)
            if (role === 'employee') {
                const aNeedsFeedback = a.feedbackGiven === false;
                const bNeedsFeedback = b.feedbackGiven === false;
                
                if (aNeedsFeedback && !bNeedsFeedback) return -1;
                if (!aNeedsFeedback && bNeedsFeedback) return 1;
            }

            // Secondary sort by priority (urgent first)
            // const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
            // const aPriority = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] ?? 4;
            // const bPriority = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] ?? 4;
            
            // if (aPriority !== bPriority) {
            //     return aPriority - bPriority;
            // }

            // Tertiary sort by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [tickets, filters, role]);

    // Handle filter changes
    const handleFiltersChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    // Count priority tickets for display
    const priorityTicketsCount = useMemo(() => {
        if (!tickets) return 0;
        
        if (role === 'worker') {
            return tickets.filter(ticket => ticket.currentWorkerStatus === 'in_queue').length;
        }
        
        if (role === 'employee') {
            return tickets.filter(ticket => ticket.feedbackGiven === false).length;
        }
        
        return 0;
    }, [tickets, role]);

    return (
        <div className="flex flex-col items-center h-full mx-10 pt-6">
            <TicketCategoryTabs onFiltersChange={handleFiltersChange} />

            {/* Priority Tickets Info Banner */}
            {priorityTicketsCount > 0 && !isLoading && (
                <div className="w-full max-w-6xl mx-auto mb-4">
                    <div className={`rounded-lg p-4 border ${
                        role === 'worker' 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-amber-50 border-amber-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                role === 'worker' 
                                    ? 'bg-blue-100' 
                                    : 'bg-amber-100'
                            }`}>
                                <span className={`text-sm font-bold ${
                                    role === 'worker' 
                                        ? 'text-blue-600' 
                                        : 'text-amber-600'
                                }`}>
                                    {priorityTicketsCount}
                                </span>
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${
                                    role === 'worker' 
                                        ? 'text-blue-800' 
                                        : 'text-amber-800'
                                }`}>
                                    {role === 'worker' 
                                        ? `${priorityTicketsCount} ticket${priorityTicketsCount !== 1 ? 's' : ''} ready to activate`
                                        : `${priorityTicketsCount} ticket${priorityTicketsCount !== 1 ? 's' : ''} awaiting feedback`
                                    }
                                </p>
                                <p className={`text-xs ${
                                    role === 'worker' 
                                        ? 'text-blue-600' 
                                        : 'text-amber-600'
                                }`}>
                                    {role === 'worker' 
                                        ? 'These tickets are shown first in your queue'
                                        : 'Help us improve by providing feedback on resolved tickets'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* if the data is not loaded yet then we will show the skeleton loader */}
            {isLoading && (
                <div className="w-full max-w-6xl p-4">
                    <TicketSkeleton />
                    <TicketSkeleton />
                </div>
            )}

            {/* if the data has been loaded then we will map that array to ticket */}
            {!isLoading && (filteredTickets?.length ?? 0) > 0 ? (
                filteredTickets.map((ticket, index) => {
                    // Determine if this is a priority ticket
                    const isPriorityTicket = (
                        (role === 'worker' && ticket.status === 'in_queue') ||
                        (role === 'employee' && ticket.feedbackGiven === false)
                    );

                    return (
                        <div 
                            className="relative w-full max-w-6xl mx-auto" 
                            key={ticket.id} 
                        >
                            {/* Priority indicator for first few priority tickets */}
                            {isPriorityTicket && index < 3 && (
                                <div className={`absolute -left-3 top-1/2 transform -translate-y-1/2 z-10 ${
                                    role === 'worker' 
                                        ? 'text-blue-500' 
                                        : 'text-amber-500'
                                }`}>
                                    <div className={`w-2 h-12 rounded-full ${
                                        role === 'worker' 
                                            ? 'bg-blue-500' 
                                            : 'bg-amber-500'
                                    }`} />
                                </div>
                            )}
                            <Ticket ticket={ticket} />
                        </div>
                    );
                })
            ) : (
                !isLoading && (
                    <div className="w-full max-w-6xl mx-auto p-8 text-center">
                        <div className="bg-gray-50 rounded-lg p-6">
                            <p className="text-gray-600 text-lg">
                                {(tickets?.length ?? 0) === 0 
                                    ? "No tickets found" 
                                    : "No tickets match the current filters"
                                }
                            </p>
                            {(tickets?.length ?? 0) > 0 && Object.values(filters).some(value => value !== '') && (
                                <button
                                    onClick={() => setFilters({ priority: '', status: '', date: '', search: '' })}
                                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default TicketsOnDash;