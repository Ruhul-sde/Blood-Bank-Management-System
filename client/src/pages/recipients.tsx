import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Recipient } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  ChevronDown, 
  MoreHorizontal, 
  Plus, 
  FileEdit, 
  Trash2, 
  UserPlus, 
  RefreshCw, 
  Search 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const recipientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  blood_type: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select a blood type.",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender.",
  }),
  dob: z.string({
    required_error: "Please select a date of birth.",
  }),
  address: z.string().optional(),
  medical_requirements: z.string().optional(),
  hospital_id: z.number().optional(),
});

export default function Recipients() {
  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ['/api/recipients'],
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ['/api/hospitals'],
  });

  const [isAddRecipientOpen, setIsAddRecipientOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [isViewRecipientOpen, setIsViewRecipientOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof recipientFormSchema>>({
    resolver: zodResolver(recipientFormSchema),
    defaultValues: {
      name: "",
      blood_type: "O+",
      gender: "male",
      dob: "",
      address: "",
      medical_requirements: "",
      hospital_id: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof recipientFormSchema>) => {
    try {
      await apiRequest("POST", "/api/recipients", values);
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      toast({
        title: "Success",
        description: "Recipient has been added successfully",
      });
      setIsAddRecipientOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding recipient:", error);
      toast({
        title: "Error",
        description: "Failed to add recipient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setIsViewRecipientOpen(true);
  };

  const formatRecipientId = (recipientId: string) => {
    return recipientId || "N/A";
  };

  // Table columns definition
  const columns: ColumnDef<Recipient>[] = [
    {
      accessorKey: "recipient_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium text-xs text-gray-900">
          {formatRecipientId(row.getValue("recipient_id"))}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
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
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => <div className="capitalize">{row.getValue("gender")}</div>,
    },
    {
      accessorKey: "hospital_id",
      header: "Hospital",
      cell: ({ row }) => {
        const hospitalId = row.getValue("hospital_id");
        const hospital = hospitals?.find((h: any) => h.id === hospitalId);
        return hospital ? hospital.name : "N/A";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Registration Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        return date ? format(new Date(date as string), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const recipient = row.original;
        
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
              <DropdownMenuItem onClick={() => handleView(recipient)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                Edit Recipient
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Create Blood Request
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete Recipient
              </DropdownMenuItem>
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
          <h1 className="text-2xl font-bold text-gray-800">Recipients Management</h1>
          <p className="text-gray-600">View and manage blood recipients in the system</p>
        </div>
        <Button onClick={() => setIsAddRecipientOpen(true)} className="bg-primary hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Recipient
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
              placeholder="Search recipients..." 
              className="pl-8 w-[250px]" 
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-gray-600">Loading recipients...</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={recipients} 
            searchKey="name" 
            searchPlaceholder="Search recipients..."
          />
        )}
      </div>

      {/* Add Recipient Sheet */}
      <Sheet open={isAddRecipientOpen} onOpenChange={setIsAddRecipientOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Recipient</SheetTitle>
            <SheetDescription>
              Fill in the details to register a new blood recipient.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
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
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hospital_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Hospital</FormLabel>
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
                      <FormDescription>
                        Hospital where the recipient is being treated
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Main St, Anytown, USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="medical_requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Requirements</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Special medical requirements or conditions..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3 pt-3">
                  <Button variant="outline" onClick={() => setIsAddRecipientOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-red-700">
                    Register Recipient
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Recipient Details */}
      <Dialog open={isViewRecipientOpen} onOpenChange={setIsViewRecipientOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recipient Information</DialogTitle>
            <DialogDescription>
              Detailed information about the selected recipient.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecipient && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-medium mb-2">
                  {selectedRecipient.name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold">{selectedRecipient.name}</h3>
                <Badge className="mt-1 bg-red-50 text-primary border-0">
                  {selectedRecipient.blood_type}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Recipient ID</Label>
                  <div className="font-medium">{selectedRecipient.recipient_id}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Gender</Label>
                  <div className="font-medium capitalize">{selectedRecipient.gender}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Date of Birth</Label>
                <div className="font-medium">
                  {format(new Date(selectedRecipient.dob), "MMM dd, yyyy")}
                </div>
              </div>
              
              {selectedRecipient.hospital_id && (
                <div>
                  <Label className="text-xs text-gray-500">Hospital</Label>
                  <div className="font-medium">
                    {hospitals?.find((h: any) => h.id === selectedRecipient.hospital_id)?.name || "Unknown Hospital"}
                  </div>
                </div>
              )}
              
              {selectedRecipient.address && (
                <div>
                  <Label className="text-xs text-gray-500">Address</Label>
                  <div className="font-medium">{selectedRecipient.address}</div>
                </div>
              )}
              
              {selectedRecipient.medical_requirements && (
                <div>
                  <Label className="text-xs text-gray-500">Medical Requirements</Label>
                  <div className="font-medium">{selectedRecipient.medical_requirements}</div>
                </div>
              )}
              
              <div>
                <Label className="text-xs text-gray-500">Registration Date</Label>
                <div className="font-medium">
                  {format(new Date(selectedRecipient.createdAt), "MMM dd, yyyy")}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="sm:flex-1" onClick={() => setIsViewRecipientOpen(false)}>
              Close
            </Button>
            <Button className="bg-secondary hover:bg-blue-700 sm:flex-1">
              Create Blood Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
