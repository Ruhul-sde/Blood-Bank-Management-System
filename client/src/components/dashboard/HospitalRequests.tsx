import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HospitalRequest {
  id: number;
  request_id: string;
  hospital_id: number;
  hospital_name: string;
  blood_type: string;
  units_needed: number;
  required_by: string | Date;
  reason: string;
  status: string;
}

interface HospitalRequestsProps {
  requests: HospitalRequest[];
}

export default function HospitalRequests({ requests }: HospitalRequestsProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bgColor: string, textColor: string, label: string }> = {
      urgent: {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        label: "Urgent"
      },
      pending: {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        label: "Standard"
      },
      completed: {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        label: "Completed"
      },
      processing: {
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        label: "Processing"
      }
    };

    const config = statusConfig[status] || {
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      label: status
    };

    return (
      <Badge variant="outline" className={`px-2 py-1 ${config.bgColor} ${config.textColor} rounded-full font-medium text-xs border-0`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Hospital Requests</h2>
        <Button variant="link" className="text-secondary p-0 h-auto font-normal">
          View All Requests
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium text-gray-800">{request.hospital_name}</h3>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Request ID: {request.request_id}</p>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">Requested Type</p>
                  <p className="text-base font-medium text-gray-800">{request.blood_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Units Needed</p>
                  <p className="text-base font-medium text-gray-800">{request.units_needed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Required By</p>
                  <p className="text-base font-medium text-gray-800">
                    {format(new Date(request.required_by), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>{request.reason}</p>
              </div>
              <div className="mt-4 flex justify-between">
                <Button className="flex-1 mr-2" variant="default">Approve</Button>
                <Button variant="outline">Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
