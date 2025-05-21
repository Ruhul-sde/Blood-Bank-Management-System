import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ActivityTableProps {
  activities: any[]; // Replace with properly typed interface if available
}

export default function ActivityTable({ activities }: ActivityTableProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      processing: { color: "bg-yellow-100 text-yellow-800", label: "Processing" },
      urgent: { color: "bg-red-100 text-red-800", label: "Urgent" },
    };

    const config = statusMap[status] || { color: "bg-gray-100 text-gray-800", label: status };
    
    return (
      <Badge variant="outline" className={`px-2 ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Date</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Donor/Recipient</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Blood Type</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Activity</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase">Units</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm text-gray-500">
                  {format(new Date(activity.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="bg-gray-200 text-gray-500">
                        {activity.donor?.name ? getInitials(activity.donor.name) : 
                         activity.hospital?.name ? getInitials(activity.hospital.name) : "UN"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {activity.donor?.name || activity.hospital?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {activity.donor?.donor_id || activity.hospital?.id && `HOSP-${activity.hospital.id}` || "N/A"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {activity.blood_type || "N/A"}
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {activity.activity_type}
                </TableCell>
                <TableCell>
                  {getStatusBadge(activity.status || "completed")}
                </TableCell>
                <TableCell className="text-sm text-gray-900">
                  {activity.units || 1}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  <a href="#" className="text-secondary hover:text-blue-700">View</a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{activities.length}</span> of <span className="font-medium">15</span> results
            </p>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
