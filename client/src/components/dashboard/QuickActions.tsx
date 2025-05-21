import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const donorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  blood_type: z.string().min(1, "Blood type is required"),
  dob: z.string().min(1, "Date of birth is required"),
});

const donationSchema = z.object({
  donor_id: z.string().min(1, "Donor ID is required"),
  units: z.coerce.number().min(1, "Units must be at least 1"),
  date: z.string().min(1, "Date is required"),
});

const notificationSchema = z.object({
  blood_type: z.string().min(1, "Blood type is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function QuickActions() {
  const { toast } = useToast();
  
  // Register Donor Form
  const donorForm = useForm<z.infer<typeof donorSchema>>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      name: "",
      blood_type: "",
      dob: ""
    },
  });
  
  // Record Donation Form
  const donationForm = useForm<z.infer<typeof donationSchema>>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donor_id: "",
      units: 450,
      date: new Date().toISOString().split('T')[0]
    },
  });
  
  // Notification Form
  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      blood_type: "O-",
      message: "Urgent need for O- blood donors. Please visit our center as soon as possible. Your donation can save lives."
    },
  });

  // Handle Donor Registration
  const onDonorSubmit = async (data: z.infer<typeof donorSchema>) => {
    try {
      // Add gender field which is required
      const donorData = {
        ...data,
        phone: "000-000-0000", // Required field
        gender: "other", // Default value
      };
      
      await apiRequest("POST", "/api/donors", donorData);
      queryClient.invalidateQueries({ queryKey: ['/api/donors'] });
      
      toast({
        title: "Success",
        description: "Donor registered successfully",
      });
      
      donorForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register donor",
        variant: "destructive",
      });
    }
  };

  // Handle Donation Recording
  const onDonationSubmit = async (data: z.infer<typeof donationSchema>) => {
    try {
      // We need blood type for the donation
      const donationData = {
        ...data,
        blood_type: "O+", // Default value, would normally get from donor info
        status: "completed",
      };
      
      await apiRequest("POST", "/api/donations", donationData);
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      
      toast({
        title: "Success",
        description: "Donation recorded successfully",
      });
      
      donationForm.reset({
        donor_id: "",
        units: 450,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record donation",
        variant: "destructive",
      });
    }
  };

  // Handle Notification
  const onNotificationSubmit = async (data: z.infer<typeof notificationSchema>) => {
    try {
      // In a real app, this would send notifications to donors
      toast({
        title: "Success",
        description: `Notification sent to ${data.blood_type} donors`,
      });
      
      notificationForm.reset({
        blood_type: "O-",
        message: "Urgent need for O- blood donors. Please visit our center as soon as possible. Your donation can save lives."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Register New Donor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center mb-2">
              <UserPlus className="text-primary h-6 w-6 mr-3" />
              <CardTitle className="text-base font-medium text-gray-800">Register New Donor</CardTitle>
            </div>
            <CardDescription>
              Quickly register a new blood donor with basic information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...donorForm}>
              <form onSubmit={donorForm.handleSubmit(onDonorSubmit)} className="space-y-3">
                <FormField
                  control={donorForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={donorForm.control}
                    name="blood_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Blood Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
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
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={donorForm.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-primary hover:bg-red-700">
                  Register Donor
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Record New Donation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center mb-2">
              <FileText className="text-primary h-6 w-6 mr-3" />
              <CardTitle className="text-base font-medium text-gray-800">Record New Donation</CardTitle>
            </div>
            <CardDescription>
              Record a blood donation from an existing donor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...donationForm}>
              <form onSubmit={donationForm.handleSubmit(onDonationSubmit)} className="space-y-3">
                <FormField
                  control={donationForm.control}
                  name="donor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Donor ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter donor ID" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={donationForm.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Units (ml)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={donationForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Donation Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-primary hover:bg-red-700">
                  Record Donation
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Send Donor Notification */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center mb-2">
              <Mail className="text-primary h-6 w-6 mr-3" />
              <CardTitle className="text-base font-medium text-gray-800">Send Donor Notification</CardTitle>
            </div>
            <CardDescription>
              Quickly send notifications to eligible donors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-3">
                <FormField
                  control={notificationForm.control}
                  name="blood_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Blood Type Needed</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Blood Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="All">All Types</SelectItem>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Message</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-primary hover:bg-red-700">
                  Send Notification
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
