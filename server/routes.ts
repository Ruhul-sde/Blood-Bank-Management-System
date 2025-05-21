import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { z } from "zod";
import {
  loginSchema,
  insertDonorSchema,
  insertRecipientSchema,
  insertBloodInventorySchema,
  insertBloodRequestSchema,
  insertDonationDriveSchema,
  insertDonationSchema,
} from "@shared/schema";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication & User Management
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(validatedData.username);

      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a production app, we would use proper JWT here
      res.status(200).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        hospital_id: user.hospital_id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard
  app.get("/api/dashboard/inventory-summary", async (req, res) => {
    try {
      const inventorySummary = await storage.getBloodInventorySummary();
      res.status(200).json(inventorySummary);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      const activitiesWithDetails = await Promise.all(
        activities.map(async (activity) => {
          let donorInfo = null;
          let recipientInfo = null;
          let hospitalInfo = null;

          if (activity.activity_type === "Blood Donation" && activity.related_id) {
            donorInfo = await storage.getDonor(activity.related_id);
          } else if (activity.activity_type === "Blood Request" && activity.related_id) {
            recipientInfo = await storage.getRecipient(activity.related_id);
          } else if (activity.activity_type === "Emergency Request" && activity.related_id) {
            hospitalInfo = await storage.getHospital(activity.related_id);
          }

          return {
            ...activity,
            donor: donorInfo,
            recipient: recipientInfo,
            hospital: hospitalInfo
          };
        })
      );

      res.status(200).json(activitiesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/upcoming-drives", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const drives = await storage.getUpcomingDonationDrives(limit);
      res.status(200).json(drives);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/recent-requests", async (req, res) => {
    try {
      const requests = await storage.getBloodRequests();
      const requestsWithHospitals = await Promise.all(
        requests.map(async (request) => {
          const hospital = await storage.getHospital(request.hospital_id);
          return {
            ...request,
            hospital_name: hospital?.name || "Unknown Hospital"
          };
        })
      );
      res.status(200).json(requestsWithHospitals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Donors
  app.get("/api/donors", async (req, res) => {
    try {
      const donors = await storage.getDonors();
      res.status(200).json(donors);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/donors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const donor = await storage.getDonor(id);
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }
      res.status(200).json(donor);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/donors", async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const donorsCount = (await storage.getDonors()).length;
      const donor_id = `DON-${currentYear}-${String(donorsCount + 1).padStart(4, '0')}`;
      
      const donorData = insertDonorSchema.parse({
        ...req.body,
        donor_id
      });
      
      const donor = await storage.createDonor(donorData);
      
      await storage.createActivity({
        activity_type: "Donor Registration",
        description: `New donor ${donor.name} registered`,
        user_id: 1,
        related_id: donor.id,
        date: new Date()
      });
      
      res.status(201).json(donor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/donors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const donor = await storage.updateDonor(id, updateData);
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }
      
      await storage.createActivity({
        activity_type: "Donor Update",
        description: `Donor ${donor.name} information updated`,
        user_id: 1,
        related_id: donor.id,
        date: new Date()
      });
      
      res.status(200).json(donor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Recipients
  app.get("/api/recipients", async (req, res) => {
    try {
      const recipients = await storage.getRecipients();
      res.status(200).json(recipients);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/recipients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipient = await storage.getRecipient(id);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      res.status(200).json(recipient);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/recipients", async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const recipientsCount = (await storage.getRecipients()).length;
      const recipient_id = `REC-${currentYear}-${String(recipientsCount + 1).padStart(4, '0')}`;
      
      const recipientData = insertRecipientSchema.parse({
        ...req.body,
        recipient_id
      });
      
      const recipient = await storage.createRecipient(recipientData);
      
      await storage.createActivity({
        activity_type: "Recipient Registration",
        description: `New recipient ${recipient.name} registered`,
        user_id: 1,
        related_id: recipient.id,
        date: new Date()
      });
      
      res.status(201).json(recipient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/recipients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const recipient = await storage.updateRecipient(id, updateData);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      await storage.createActivity({
        activity_type: "Recipient Update",
        description: `Recipient ${recipient.name} information updated`,
        user_id: 1,
        related_id: recipient.id,
        date: new Date()
      });
      
      res.status(200).json(recipient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Blood Inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getBloodInventory();
      res.status(200).json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const inventoryData = insertBloodInventorySchema.parse(req.body);
      const inventory = await storage.createBloodInventory(inventoryData);
      
      await storage.createActivity({
        activity_type: "Inventory Update",
        description: `${inventory.units} units of ${inventory.blood_type} added to inventory`,
        user_id: 1,
        related_id: inventory.id,
        date: new Date()
      });
      
      res.status(201).json(inventory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Blood Requests
  app.get("/api/requests", async (req, res) => {
    try {
      const requests = await storage.getBloodRequests();
      const requestsWithHospitals = await Promise.all(
        requests.map(async (request) => {
          const hospital = await storage.getHospital(request.hospital_id);
          return {
            ...request,
            hospital_name: hospital?.name || "Unknown Hospital"
          };
        })
      );
      res.status(200).json(requestsWithHospitals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/requests", async (req, res) => {
    try {
      const requestData = insertBloodRequestSchema.parse(req.body);
      const bloodRequest = await storage.createBloodRequest(requestData);
      
      const hospital = await storage.getHospital(bloodRequest.hospital_id);
      
      await storage.createActivity({
        activity_type: "Blood Request",
        description: `${hospital?.name || "Unknown Hospital"} requested ${bloodRequest.units_needed} units of ${bloodRequest.blood_type}`,
        user_id: 1,
        related_id: bloodRequest.id,
        date: new Date()
      });
      
      res.status(201).json(bloodRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const request = await storage.updateBloodRequest(id, updateData);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const hospital = await storage.getHospital(request.hospital_id);
      
      await storage.createActivity({
        activity_type: "Request Update",
        description: `${hospital?.name || "Unknown Hospital"} request status updated to ${request.status}`,
        user_id: 1,
        related_id: request.id,
        date: new Date()
      });
      
      res.status(200).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Donation Drives
  app.get("/api/donation-drives", async (req, res) => {
    try {
      const drives = await storage.getDonationDrives();
      res.status(200).json(drives);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/donation-drives", async (req, res) => {
    try {
      const driveData = insertDonationDriveSchema.parse(req.body);
      const drive = await storage.createDonationDrive(driveData);
      
      await storage.createActivity({
        activity_type: "Donation Drive",
        description: `New donation drive "${drive.title}" scheduled for ${format(new Date(drive.date), 'MMM dd, yyyy')}`,
        user_id: 1,
        related_id: drive.id,
        date: new Date()
      });
      
      res.status(201).json(drive);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Donations
  app.post("/api/donations", async (req, res) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(donationData);
      
      const donor = await storage.getDonor(donation.donor_id);
      
      // Update donor's last donation date
      if (donor) {
        await storage.updateDonor(donor.id, {
          last_donation: donation.date,
        });
      }
      
      // Create an inventory entry
      const expiryDate = new Date(donation.date);
      expiryDate.setDate(expiryDate.getDate() + 42); // Blood typically expires after 42 days
      
      const formattedExpiryDate = format(expiryDate, 'yyyy-MM-dd');
      
      const inventory = await storage.createBloodInventory({
        blood_type: donation.blood_type,
        units: donation.units,
        donation_date: donation.date,
        expiry_date: formattedExpiryDate,
        donor_id: donation.donor_id,
        status: "completed"
      });
      
      // Update the donation record with the inventory ID
      await storage.updateDonation(donation.id, {
        inventory_id: inventory.id
      });
      
      await storage.createActivity({
        activity_type: "Blood Donation",
        description: `${donor?.name || "Unknown donor"} donated ${donation.units} units of ${donation.blood_type} blood`,
        user_id: 1,
        related_id: donor?.id || 0,
        date: new Date()
      });
      
      res.status(201).json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Hospitals
  app.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals = await storage.getHospitals();
      res.status(200).json(hospitals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
