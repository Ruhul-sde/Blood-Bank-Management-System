import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationDrive } from "@shared/schema";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DonationDrivesProps {
  drives: DonationDrive[];
}

export default function DonationDrives({ drives }: DonationDrivesProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Upcoming Donation Drives
          </CardTitle>
          <Button variant="link" className="text-secondary p-0 h-auto font-normal">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[320px]">
        {drives.map((drive) => (
          <div key={drive.id} className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div className="text-2xl font-bold text-primary">
                  {format(new Date(drive.date), "dd")}
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(drive.date), "MMM").toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-800">{drive.title}</h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{drive.start_time} - {drive.end_time}</span>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{drive.location}</span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">
                    Goal: {drive.target_units} units
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Current Registrations: {drive.registrations}
                  </span>
                </div>
              </div>
              <button className="ml-2 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-gray-200 p-4">
        <Button className="w-full bg-secondary hover:bg-blue-600" variant="default">
          Schedule New Donation Drive
        </Button>
      </CardFooter>
    </Card>
  );
}
