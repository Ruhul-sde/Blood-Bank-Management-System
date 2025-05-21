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
import { BloodInventory } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  Search,
  AlertCircle,
  Loader2,
  Filter,
  ArrowUpDown 
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const inventoryFormSchema = z.object({
  blood_type: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select a blood type.",
  }),
  units: z.coerce.number().min(1, "Units must be at least 1."),
  donation_date: z.string({
    required_error: "Please select a donation date.",
  }),
  donor_id: z.coerce.number().min(1, "Please select a donor."),
});

export default function Inventory() {
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['/api/inventory'],
  });

  const { data: donors = [] } = useQuery({
    queryKey: ['/api/donors'],
  });

  const { data: inventorySummary = [] } = useQuery({
    queryKey: ['/api/dashboard/inventory-summary'],
  });

  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<BloodInventory | null>(null);
  const [isViewInventoryOpen, setIsViewInventoryOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof inventoryFormSchema>>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      blood_type: "O+",
      units: 1,
      donation_date: new Date().toISOString().split('T')[0],
      donor_id: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof inventoryFormSchema>) => {
    try {
      // Calculate expiry date (42 days from donation date)
      const donationDate = new Date(values.donation_date);
      const expiryDate = new Date(donationDate);
      expiryDate.setDate(donationDate.getDate() + 42);
      
      const inventoryData = {
        ...values,
        expiry_date: expiryDate,
        status: "completed"
      };
      
      await apiRequest("POST", "/api/inventory", inventoryData);
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/inventory-summary'] });
      
      toast({
        title: "Success",
        description: "Inventory has been added successfully",
      });
      setIsAddInventoryOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = (inventory: BloodInventory) => {
    setSelectedInventory(inventory);
    setIsViewInventoryOpen(true);
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = differenceInDays(expiry, today);
    
    if (daysRemaining < 0) {
      return { status: "Expired", badge: "bg-red-100 text-red-800" };
    } else if (daysRemaining < 7) {
      return { status: "Expiring Soon", badge: "bg-amber-100 text-amber-800" };
    } else {
      return { status: "Valid", badge: "bg-green-100 text-green-800" };
    }
  };

  // Chart Data
  const pieChartData = inventorySummary.map((item: any) => ({
    name: item.blood_type,
    value: item.units,
  }));

  const CHART_COLORS = ['#E53935', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0', '#FF5722', '#607D8B', '#795548'];

  // Table columns definition
  const columns: ColumnDef<BloodInventory>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium text-xs text-gray-900">
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "blood_type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Blood Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-red-50 text-primary border-0 font-medium">
          {row.getValue("blood_type")}
        </Badge>
      ),
    },
    {
      accessorKey: "units",
      header: "Units",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("units")}</div>
      ),
    },
    {
      accessorKey: "donation_date",
      header: "Donation Date",
      cell: ({ row }) => {
        const date = row.getValue("donation_date");
        return date ? format(new Date(date as string), "MMM dd, yyyy") : "N/A";
      },
    },
    {
      accessorKey: "expiry_date",
      header: "Expiry Date",
      cell: ({ row }) => {
        const date = row.getValue("expiry_date") as string;
        const expiryStatus = getExpiryStatus(date);
        
        return (
          <div className="flex flex-col">
            <span>{format(new Date(date), "MMM dd, yyyy")}</span>
            <Badge variant="outline" className={`mt-1 ${expiryStatus.badge} border-0 text-xs`}>
              {expiryStatus.status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "donor_id",
      header: "Donor",
      cell: ({ row }) => {
        const donorId = row.getValue("donor_id");
        const donor = donors?.find((d: any) => d.id === donorId);
        return donor ? donor.name : `Donor #${donorId}`;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let badgeClass = "";
        
        switch (status) {
          case "completed":
            badgeClass = "bg-green-100 text-green-800";
            break;
          case "pending":
            badgeClass = "bg-yellow-100 text-yellow-800";
            break;
          default:
            badgeClass = "bg-gray-100 text-gray-800";
        }
        
        return (
          <Badge variant="outline" className={`${badgeClass} border-0 capitalize`}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const inventory = row.original;
        
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
              <DropdownMenuItem onClick={() => handleView(inventory)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                Update Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Discard Unit
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
          <h1 className="text-2xl font-bold text-gray-800">Blood Inventory Management</h1>
          <p className="text-gray-600">View and manage blood units in the inventory</p>
        </div>
        <Button onClick={() => setIsAddInventoryOpen(true)} className="bg-primary hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Add to Inventory
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="mb-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory List</TabsTrigger>
          <TabsTrigger value="dashboard">Inventory Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
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
                
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search inventory..." 
                  className="pl-8 w-[250px]" 
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-gray-600">Loading inventory data...</p>
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={inventory} 
                searchKey="blood_type" 
                searchPlaceholder="Search by blood type..."
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Blood Inventory Overview</CardTitle>
                <CardDescription>
                  Summary of current blood inventory levels by blood type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="dashboard-grid">
                  {inventorySummary.map((item: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-2xl font-bold text-gray-800">{item.blood_type}</span>
                          <p className="text-sm text-gray-600 mt-1">Blood Type</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${item.status === "adequate" ? "bg-green-100 text-green-800" : ""}
                            ${item.status === "moderate" ? "bg-amber-100 text-amber-800" : ""}
                            ${item.status === "critical" ? "bg-red-100 text-red-800" : ""}
                            border-0
                          `}
                        >
                          {item.status === "adequate" ? "Adequate" : ""}
                          {item.status === "moderate" ? "Moderate" : ""}
                          {item.status === "critical" ? "Critical" : ""}
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Units Available</span>
                          <span className="text-sm font-medium text-gray-800">{item.units} units</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full 
                              ${item.status === "adequate" ? "bg-green-500" : ""}
                              ${item.status === "moderate" ? "bg-amber-500" : ""}
                              ${item.status === "critical" ? "bg-red-500" : ""}
                            `} 
                            style={{ width: `${Math.min(100, (item.units / item.threshold) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>Expires soon: {item.expiring_soon} units</span>
                        <span>Threshold: {item.threshold} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blood Type Distribution</CardTitle>
                <CardDescription>
                  Current inventory by blood type
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expiration Analysis</CardTitle>
                <CardDescription>
                  Blood units expiring in the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={inventorySummary}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="blood_type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="Expiring Soon" dataKey="expiring_soon" fill="#FFC107" />
                      <Bar name="Total Units" dataKey="units" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Inventory Sheet */}
      <Sheet open={isAddInventoryOpen} onOpenChange={setIsAddInventoryOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add to Inventory</SheetTitle>
            <SheetDescription>
              Add new blood units to the inventory.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  name="units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of units to add to inventory
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="donation_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Donation Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="donor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Donor</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select donor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {donors?.map((donor: any) => (
                            <SelectItem key={donor.id} value={donor.id.toString()}>
                              {donor.name} ({donor.blood_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3 pt-3">
                  <Button variant="outline" onClick={() => setIsAddInventoryOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-red-700">
                    Add to Inventory
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Inventory Details */}
      <Dialog open={isViewInventoryOpen} onOpenChange={setIsViewInventoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Blood Unit Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected blood unit.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInventory && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-center mb-4">
                <Badge className="text-lg py-2 px-4 bg-red-50 text-primary border-0 font-bold">
                  {selectedInventory.blood_type}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Inventory ID</Label>
                  <div className="font-medium">{selectedInventory.id}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Units</Label>
                  <div className="font-medium">{selectedInventory.units}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Donation Date</Label>
                  <div className="font-medium">
                    {format(new Date(selectedInventory.donation_date), "MMM dd, yyyy")}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Expiry Date</Label>
                  <div className="font-medium">
                    {format(new Date(selectedInventory.expiry_date), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <div className="font-medium capitalize">{selectedInventory.status}</div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Donor</Label>
                <div className="font-medium">
                  {donors?.find((d: any) => d.id === selectedInventory.donor_id)?.name || `Donor #${selectedInventory.donor_id}`}
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Created At</Label>
                <div className="font-medium">
                  {format(new Date(selectedInventory.createdAt), "MMM dd, yyyy HH:mm")}
                </div>
              </div>
              
              {getExpiryStatus(selectedInventory.expiry_date).status === "Expired" && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Expired Blood Unit</p>
                    <p className="text-sm text-red-700">This blood unit has expired and should be discarded.</p>
                  </div>
                </div>
              )}
              
              {getExpiryStatus(selectedInventory.expiry_date).status === "Expiring Soon" && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Expiring Soon</p>
                    <p className="text-sm text-amber-700">This blood unit is expiring soon and should be used promptly.</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="sm:flex-1" onClick={() => setIsViewInventoryOpen(false)}>
              Close
            </Button>
            {selectedInventory && getExpiryStatus(selectedInventory.expiry_date).status === "Expired" ? (
              <Button variant="destructive" className="sm:flex-1">
                Discard Unit
              </Button>
            ) : (
              <Button className="bg-secondary hover:bg-blue-700 sm:flex-1">
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
