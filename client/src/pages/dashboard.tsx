import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import InventoryCard from "@/components/dashboard/InventoryCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import DonationDrives from "@/components/dashboard/DonationDrives";
import CompatibilityChart from "@/components/dashboard/CompatibilityChart";
import HospitalRequests from "@/components/dashboard/HospitalRequests";
import QuickActions from "@/components/dashboard/QuickActions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  // Get inventory summary data
  const { data: inventorySummary = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['/api/dashboard/inventory-summary'],
  });

  // Get recent activities
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['/api/dashboard/activities'],
  });

  // Get upcoming donation drives
  const { data: upcomingDrives = [], isLoading: loadingDrives } = useQuery({
    queryKey: ['/api/dashboard/upcoming-drives'],
  });

  // Get recent hospital requests
  const { data: hospitalRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['/api/dashboard/recent-requests'],
  });

  // Check if there are any critical blood types
  const criticalBloodTypes = inventorySummary.filter(
    (item: any) => item.status === 'critical'
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back. Here's an overview of today's blood bank status.</p>
      </div>

      {/* Critical Alert Banner */}
      {criticalBloodTypes.length > 0 && (
        <Alert variant="destructive" className="bg-red-50 border-l-4 border-primary mb-6 text-red-700">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-medium text-primary">Critical Alert</AlertTitle>
          <AlertDescription className="text-sm text-red-700">
            Low inventory for {criticalBloodTypes.map((item: any) => item.blood_type).join(', ')} blood type(s). 
            Currently at {criticalBloodTypes[0].units} units ({Math.round((criticalBloodTypes[0].units / criticalBloodTypes[0].threshold) * 100)}% of recommended levels).
          </AlertDescription>
        </Alert>
      )}

      {/* Blood Inventory Overview Cards */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Blood Inventory Overview</h2>
          <Button variant="link" className="text-secondary p-0 h-auto font-normal">
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
        <div className="dashboard-grid">
          {loadingInventory ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-5 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))
          ) : (
            inventorySummary.map((item: any, index: number) => (
              <InventoryCard
                key={index}
                bloodType={item.blood_type}
                units={item.units}
                status={item.status}
                threshold={item.threshold}
                expiringUnits={item.expiring_soon}
              />
            ))
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Today</Button>
            <Button variant="outline" size="sm">This Week</Button>
            <Button className="bg-secondary text-white" size="sm">This Month</Button>
          </div>
        </div>
        
        {loadingActivities ? (
          <div className="bg-white rounded-lg shadow-md p-5 animate-pulse">
            <div className="h-60 flex items-center justify-center">
              <p className="text-gray-400">Loading activities...</p>
            </div>
          </div>
        ) : (
          <ActivityTable activities={activities} />
        )}
      </section>

      {/* Upcoming Donation Drives and Blood Compatibility Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Donation Drives */}
        {loadingDrives ? (
          <div className="bg-white rounded-lg shadow-md p-5 animate-pulse">
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-400">Loading donation drives...</p>
            </div>
          </div>
        ) : (
          <DonationDrives drives={upcomingDrives} />
        )}

        {/* Blood Compatibility Chart */}
        <CompatibilityChart />
      </div>
      
      {/* Recent Hospital Requests */}
      <section className="mb-8">
        {loadingRequests ? (
          <div className="bg-white rounded-lg shadow-md p-5 animate-pulse">
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-400">Loading hospital requests...</p>
            </div>
          </div>
        ) : (
          <HospitalRequests requests={hospitalRequests} />
        )}
      </section>
      
      {/* Quick Add */}
      <section className="mb-8">
        <QuickActions />
      </section>
    </div>
  );
}
