import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { 
  ColumnDef, 
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { BloodRequest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  Search,
  Check,
  X,
  Clock,
  AlertCircle 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const requestFormSchema = z.object({
  hospital_id: z.coerce.number().min(1, "Please select a hospital."),
  blood_type: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select a blood type.",
  }),
  units_needed: z.coerce.number().min(1, "Units must be at least 1."),
  required_by: z.string({
    required_error: "Please select a required by date.",
  }),
  reason: z.string().min(5, "Reason must be at least 5 characters."),
  status: z.enum(["pending", "urgent", "approved", "completed", "rejected"]).default("pending"),
});

export default function Requests() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/requests'],
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ['/api/hospitals'],
  });

  const { data: inventorySummary = [] } = useQuery({
    queryKey: ['/api/dashboard/inventory-summary'],
  });

  const { user } = useAuth();
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [isViewRequestOpen, setIsViewRequestOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof requestFormSchema>>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      hospital_id: user?.hospital_id || undefined,
      blood_type: "O+",
      units_needed: 1,
      required_by: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      reason: "",
      status: "pending",
    },
  });

  const onSubmit = async (values: z.infer<typeof requestFormSchema>) => {
    try {
      // If it's a hospital user, use their hospital_id
      if (user?.role === "hospital" && user?.hospital_id) {
        values.hospital_id = user.hospital_id;
      }
      
      const requestData = {
        ...values,
      };
      
      await apiRequest("POST", "/api/requests", requestData);
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      
      toast({
        title: "Success",
        description: "Blood request has been submitted successfully",
      });
      setIsAddRequestOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = (request: BloodRequest) => {
    setSelectedRequest(request);
    setIsViewRequestOpen(true);
  };

  const handleApprove = async (id: number) => {
    try {
      await apiRequest("PUT", `/api/requests/${id}`, { status: "approved" });
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      
      toast({
        title: "Success",
        description: "Request has been approved",
      });
      
      setIsViewRequestOpen(false);
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await apiRequest("PUT", `/api/requests/${id}`, { status: "rejected" });
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      
      toast({
        title: "Success",
        description: "Request has been rejected",
      });
      
      setIsViewRequestOpen(false);
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { 
        color: "bg-yellow-100 text-yellow-800", 
        icon: <Clock className="h-3 w-3 mr-1" /> 
      },
      approved: { 
        color: "bg-green-100 text-green-800", 
        icon: <Check className="h-3 w-3 mr-1" /> 
      },
      completed: { 
        color: "bg-blue-100 text-blue-800", 
        icon: <Check className="h-3 w-3 mr-1" /> 
      },
      rejected: { 
        color: "bg-gray-100 text-gray-800", 
        icon: <X className="h-3 w-3 mr-1" /> 
      },
      urgent: { 
        color: "bg-red-100 text-red-800", 
        icon: <AlertCircle className="h-3 w-3 mr-1" /> 
      },
      processing: {
        color: "bg-blue-100 text-blue-800",
        icon: <Clock className="h-3 w-3 mr-1" />
      }
    };

    const config = statusMap[status] || { color: "bg-gray-100 text-gray-800", icon: null };
    
    return (
      <Badge variant="outline" className={`${config.color} border-0 flex items-center`}>
        {config.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  // Check if blood type is available in inventory
  const checkAvailability = (bloodType: string, unitsNeeded: number) => {
    const inventoryItem = inventorySummary.find((item: any) => item.blood_type === bloodType);
    if (!inventoryItem) return { available: false, units: 0 };
    
    return { 
      available: inventoryItem.units >= unitsNeeded,
      units: inventoryItem.units
    };
  };

  // Table columns definition
  const columns: ColumnDef<BloodRequest>[] = [
    {
      accessorKey: "request_id",
      header: "Request ID",
      cell: ({ row }) => (
        <div className="font-medium text-xs text-gray-900">
          {row.getValue("request_id")}
        </div>
      ),
    },
    {
      accessorKey: "hospital_name",
      header: "Hospital",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("hospital_name")}</div>
      ),
    },
    {
      accessorKey: "blood_type",
      header: "Blood Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-red-50 text-primary border-0 font-medium">
          {row.getValue("blood_type")}
        </Badge>
      ),
    },
    {
      accessorKey: "units_needed",
      header: "Units",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("units_needed")}</div>
      ),
    },
    {
      accessorKey: "required_by",
      header: "Required By",
      cell: ({ row }) => {
        const date = row.getValue("required_by");
        const today = new Date();
        const requiredDate = new Date(date as string);
        const daysRemaining = differenceInDays(requiredDate, today);
        
        let urgencyClass = "";
        if (daysRemaining < 0) {
          urgencyClass = "text-red-600";
        } else if (daysRemaining < 2) {
          urgencyClass = "text-amber-600";
        }
        
        return (
          <div className={urgencyClass}>
            {format(new Date(date as string), "MMM dd, yyyy")}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "createdAt",
      header: "Request Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return date ? format(new Date(date as string), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(request)}>
                View Details
              </DropdownMenuItem>
              {user?.role !== 'hospital' && request.status === 'pending' && (
                <>
                  <DropdownMenuItem onClick={() => handleApprove(request.id)}>
                    Approve Request
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleReject(request.id)}>
                    Reject Request
                  </DropdownMenuItem>
                </>
              )}
              {request.status === 'approved' && (
                <DropdownMenuItem>
                  Mark as Completed
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blood Requests</h1>
          <p className="text-gray-600">
            {user?.role === "hospital" 
              ? "Manage your blood requests to blood banks" 
              : "View and manage blood requests from hospitals"
            }
          </p>
        </div>
        <Button onClick={() => setIsAddRequestOpen(true)} className="bg-primary hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          New Blood Request
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Blood Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search requests..." 
              className="pl-8 w-[250px]" 
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={requests} 
            searchKey="hospital_name" 
            searchPlaceholder="Search by hospital..."
          />
        )}
      </div>

      {/* Add Request Sheet */}
      <Sheet open={isAddRequestOpen} onOpenChange={setIsAddRequestOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Blood Request</SheetTitle>
            <SheetDescription>
              Submit a request for blood units.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {user?.role !== 'hospital' && (
                  <FormField
                    control={form.control}
                    name="hospital_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select hospital" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hospitals?.map((hospital: any) => (
                              <SelectItem key={hospital.id} value={hospital.id.toString()}>
                                {hospital.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="blood_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="units_needed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units Needed</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="required_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required By</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Request</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please provide details about why this blood is needed..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Standard</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3 pt-3">
                  <Button variant="outline" onClick={() => setIsAddRequestOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-red-700">
                    Submit Request
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Request Details */}
      <Dialog open={isViewRequestOpen} onOpenChange={setIsViewRequestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Blood Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected blood request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center mb-2">
                <Badge className="text-lg py-2 px-4 bg-red-50 text-primary border-0 font-bold">
                  {selectedRequest.blood_type}
                </Badge>
                {getStatusBadge(selectedRequest.status)}
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Request ID</Label>
                <div className="font-medium">{selectedRequest.request_id}</div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Hospital</Label>
                <div className="font-medium">{selectedRequest.hospital_name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Units Needed</Label>
                  <div className="font-medium">{selectedRequest.units_needed}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Required By</Label>
                  <div className="font-medium">
                    {format(new Date(selectedRequest.required_by), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Reason</Label>
                <div className="font-medium">{selectedRequest.reason}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Request Date</Label>
                  <div className="font-medium">
                    {format(new Date(selectedRequest.createdAt), "MMM dd, yyyy")}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="font-medium capitalize">{selectedRequest.status}</div>
                </div>
              </div>
              
              {/* Availability Check (for staff/admin users) */}
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <div className="mt-2 p-3 border rounded-md">
                  <h4 className="font-medium mb-2">Inventory Check</h4>
                  {(() => {
                    const availability = checkAvailability(
                      selectedRequest.blood_type, 
                      selectedRequest.units_needed
                    );
                    
                    if (availability.available) {
                      return (
                        <div className="flex items-center text-green-700">
                          <Check className="h-4 w-4 mr-1" />
                          <span>
                            Available - {availability.units} units in inventory
                          </span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex items-center text-red-700">
                          <X className="h-4 w-4 mr-1" />
                          <span>
                            Insufficient - Only {availability.units} units available of {selectedRequest.units_needed} needed
                          </span>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="sm:flex-1" onClick={() => setIsViewRequestOpen(false)}>
              Close
            </Button>
            
            {/* Show different buttons based on user role and request status */}
            {user?.role !== 'hospital' && selectedRequest?.status === 'pending' && (
              <>
                <Button onClick={() => selectedRequest && handleReject(selectedRequest.id)} variant="outline" className="sm:flex-1 border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50">
                  Reject
                </Button>
                <Button onClick={() => selectedRequest && handleApprove(selectedRequest.id)} className="bg-primary hover:bg-red-700 sm:flex-1">
                  Approve
                </Button>
              </>
            )}
            
            {user?.role === 'hospital' && selectedRequest?.status === 'pending' && (
              <Button variant="outline" className="sm:flex-1 border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50">
                Cancel Request
              </Button>
            )}
            
            {selectedRequest?.status === 'approved' && (
              <Button className="bg-secondary hover:bg-blue-700 sm:flex-1">
                Mark as Completed
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
