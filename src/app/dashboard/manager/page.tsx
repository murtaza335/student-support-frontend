'use client'

import { useSecurityCodes } from "~/hooks/securityCodes";
import React from "react";
import '~/styles/globals.css';
import Loader from '~/app/_components/Loader';
import { api } from '~/trpc/react';
import SecurityCodeHandler from "~/app/_components/securityCodes/SecurityCodesPopupHandler";
import TicketsOnDash from "~/app/_components/tickets/TicketsOnDash";
import { useUser } from "@clerk/nextjs";
import LoginRequired from "~/app/_components/unauthorized/loginToContinue";
import Unauthorized from "~/app/_components/unauthorized/unauthorized";
import ErrorLoading from "~/app/_components/unauthorized/errorLoading";


export default function ManagerPage() {
  const { showModal, setShowModal, isError, codes, retry,
  } = useSecurityCodes();
  // here we will make an api call to get the complaints created by the employee
  const { data: tickets, isLoading: ticketsLoading, error: ticketsError } = api.managerDash.getTeamComplaints.useQuery();


  //   this verifies if the user has the right permissions to access this page
  const { user, isLoaded, isSignedIn } = useUser();


  // below 3 if's are used to handle the loading state, unauthorized access, and user role verification
  // and the same is being used in all the dashboard pages

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center">
      <Loader />
      <p className="text-gray-500 pl-5">Please wait, while we authorize you...</p>
    </div>;
  }
  if (isLoaded && !isSignedIn) {
    return <LoginRequired />;
  }
  if (user.publicMetadata.role !== 'manager') {
    return <Unauthorized />;
  }
  if(!user || ticketsError) {
        return <ErrorLoading />;
      }
  
  


  return (
    <div className="flex h-[100%] w-[100%] overflow-x-hidden">
      {/* <Sidebar /> */}
      <SecurityCodeHandler
        showModal={showModal}
        setShowModal={setShowModal}
        codes={codes}
        isError={isError}
        retry={retry}
      />

      <main className="flex-1 bg-white overflow-y-hidden mr-auto ml-auto pb-20">

        {/* this is where the tickets will be displayed, this component has the tabs and the ticket cards */}
        <TicketsOnDash tickets={tickets?.data} isLoading={ticketsLoading}/>

      </main>
    </div>
  );
};
