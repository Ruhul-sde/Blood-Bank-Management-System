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
import { Donor } from "@shared/schema";
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
  Search,
  CheckCircle2,
  XCircle 
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

const donorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
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
  medical_conditions: z.string().optional(),
});

export default function Donors() {
  const { data: donors = [], isLoading } = useQuery({
    queryKey: ['/api/donors'],
  });

  const [isAddDonorOpen, setIsAddDonorOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isViewDonorOpen, setIsViewDonorOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof donorFormSchema>>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      blood_type: "O+",
      gender: "male",
      dob: "",
      address: "",
      medical_conditions: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof donorFormSchema>) => {
    try {
      await apiRequest("POST", "/api/donors", values);
      queryClient.invalidateQueries({ queryKey: ['/api/donors'] });
      toast({
        title: "Success",
        description: "Donor has been added successfully",
      });
      setIsAddDonorOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding donor:", error);
      toast({
        title: "Error",
        description: "Failed to add donor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = (donor: Donor) => {
    setSelectedDonor(donor);
    setIsViewDonorOpen(true);
  };

  const formatDonorId = (donorId: string) => {
    return donorId || "N/A";
  };

  // Table columns definition
  const columns: ColumnDef<Donor>[] = [
    {
      accessorKey: "donor_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium text-xs text-gray-900">
          {formatDonorId(row.getValue("donor_id"))}
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
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "last_donation",
      header: "Last Donation",
      cell: ({ row }) => {
        const date = row.getValue("last_donation");
        return date ? format(new Date(date as string), "MMM dd, yyyy") : "Never donated";
      },
    },
    {
      accessorKey: "eligible_to_donate",
      header: "Eligibility",
      cell: ({ row }) => {
        const isEligible = row.getValue("eligible_to_donate");
        return isEligible ? (
          <Badge className="bg-green-100 text-green-800 border-0">Eligible</Badge>
        ) : (
          <Badge className="bg-red-100 text-red-800 border-0">Not Eligible</Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const donor = row.original;
        
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
              <DropdownMenuItem onClick={() => handleView(donor)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                Edit Donor
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Record Donation
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete Donor
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
          <h1 className="text-2xl font-bold text-gray-800">Donors Management</h1>
          <p className="text-gray-600">View and manage blood donors in the system</p>
        </div>
        <Button onClick={() => setIsAddDonorOpen(true)} className="bg-primary hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Donor
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
              placeholder="Search donors..." 
              className="pl-8 w-[250px]" 
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-gray-600">Loading donors...</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={donors} 
            searchKey="name" 
            searchPlaceholder="Search donors..."
          />
        )}
      </div>

      {/* Add Donor Sheet */}
      <Sheet open={isAddDonorOpen} onOpenChange={setIsAddDonorOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Donor</SheetTitle>
            <SheetDescription>
              Fill in the details to register a new blood donor.
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="555-123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="johndoe@example.com" {...field} />
                      </FormControl>
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
                  name="medical_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any relevant medical conditions..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3 pt-3">
                  <Button variant="outline" onClick={() => setIsAddDonorOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-red-700">
                    Register Donor
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Donor Details */}
      <Dialog open={isViewDonorOpen} onOpenChange={setIsViewDonorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Donor Information</DialogTitle>
            <DialogDescription>
              Detailed information about the selected donor.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDonor && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-medium mb-2">
                  {selectedDonor.name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold">{selectedDonor.name}</h3>
                <Badge className="mt-1 bg-red-50 text-primary border-0">
                  {selectedDonor.blood_type}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Donor ID</Label>
                  <div className="font-medium">{selectedDonor.donor_id}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div>
                    {selectedDonor.eligible_to_donate ? (
                      <Badge className="bg-green-100 text-green-800 border-0">Eligible</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-0">Not Eligible</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Gender</Label>
                  <div className="font-medium capitalize">{selectedDonor.gender}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Date of Birth</Label>
                  <div className="font-medium">
                    {format(new Date(selectedDonor.dob), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Phone</Label>
                <div className="font-medium">{selectedDonor.phone}</div>
              </div>
              
              {selectedDonor.email && (
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <div className="font-medium">{selectedDonor.email}</div>
                </div>
              )}
              
              {selectedDonor.address && (
                <div>
                  <Label className="text-xs text-gray-500">Address</Label>
                  <div className="font-medium">{selectedDonor.address}</div>
                </div>
              )}
              
              <div>
                <Label className="text-xs text-gray-500">Last Donation</Label>
                <div className="font-medium">
                  {selectedDonor.last_donation 
                    ? format(new Date(selectedDonor.last_donation), "MMM dd, yyyy")
                    : "Never donated"}
                </div>
              </div>
              
              {selectedDonor.medical_conditions && (
                <div>
                  <Label className="text-xs text-gray-500">Medical Conditions</Label>
                  <div className="font-medium">{selectedDonor.medical_conditions}</div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="sm:flex-1" onClick={() => setIsViewDonorOpen(false)}>
              Close
            </Button>
            <Button className="bg-secondary hover:bg-blue-700 sm:flex-1">
              Record Donation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
