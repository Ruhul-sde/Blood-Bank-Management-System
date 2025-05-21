import {
  User, InsertUser,
  Donor, InsertDonor,
  Recipient, InsertRecipient,
  Hospital, InsertHospital,
  BloodInventory, InsertBloodInventory,
  BloodRequest, InsertBloodRequest,
  DonationDrive, InsertDonationDrive,
  Donation, InsertDonation,
  Activity, InsertActivity,
  bloodTypeEnum
} from "@shared/schema";
import { format } from "date-fns";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Donors
  getDonors(): Promise<Donor[]>;
  getDonor(id: number): Promise<Donor | undefined>;
  getDonorByDonorId(donorId: string): Promise<Donor | undefined>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonor(id: number, donor: Partial<InsertDonor>): Promise<Donor | undefined>;

  // Recipients
  getRecipients(): Promise<Recipient[]>;
  getRecipient(id: number): Promise<Recipient | undefined>;
  getRecipientByRecipientId(recipientId: string): Promise<Recipient | undefined>;
  createRecipient(recipient: InsertRecipient): Promise<Recipient>;
  updateRecipient(id: number, recipient: Partial<InsertRecipient>): Promise<Recipient | undefined>;

  // Hospitals
  getHospitals(): Promise<Hospital[]>;
  getHospital(id: number): Promise<Hospital | undefined>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;

  // Blood Inventory
  getBloodInventory(): Promise<BloodInventory[]>;
  getBloodInventoryByType(bloodType: string): Promise<BloodInventory[]>;
  getBloodInventorySummary(): Promise<{
    blood_type: string;
    units: number;
    status: "adequate" | "moderate" | "critical";
    threshold: number;
    expiring_soon: number;
  }[]>;
  createBloodInventory(inventory: InsertBloodInventory): Promise<BloodInventory>;
  updateBloodInventory(id: number, inventory: Partial<InsertBloodInventory>): Promise<BloodInventory | undefined>;

  // Blood Requests
  getBloodRequests(): Promise<BloodRequest[]>;
  getBloodRequestById(id: number): Promise<BloodRequest | undefined>;
  createBloodRequest(request: InsertBloodRequest): Promise<BloodRequest>;
  updateBloodRequest(id: number, request: Partial<InsertBloodRequest>): Promise<BloodRequest | undefined>;

  // Donation Drives
  getDonationDrives(): Promise<DonationDrive[]>;
  getUpcomingDonationDrives(limit?: number): Promise<DonationDrive[]>;
  getDonationDrive(id: number): Promise<DonationDrive | undefined>;
  createDonationDrive(drive: InsertDonationDrive): Promise<DonationDrive>;
  updateDonationDrive(id: number, drive: Partial<InsertDonationDrive>): Promise<DonationDrive | undefined>;

  // Donations
  getDonations(): Promise<Donation[]>;
  getDonation(id: number): Promise<Donation | undefined>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonation(id: number, donation: Partial<InsertDonation>): Promise<Donation | undefined>;

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private donors: Map<number, Donor>;
  private recipients: Map<number, Recipient>;
  private hospitals: Map<number, Hospital>;
  private bloodInventory: Map<number, BloodInventory>;
  private bloodRequests: Map<number, BloodRequest>;
  private donationDrives: Map<number, DonationDrive>;
  private donations: Map<number, Donation>;
  private activities: Map<number, Activity>;

  private currentId: {
    users: number;
    donors: number;
    recipients: number;
    hospitals: number;
    bloodInventory: number;
    bloodRequests: number;
    donationDrives: number;
    donations: number;
    activities: number;
  };

  constructor() {
    this.users = new Map();
    this.donors = new Map();
    this.recipients = new Map();
    this.hospitals = new Map();
    this.bloodInventory = new Map();
    this.bloodRequests = new Map();
    this.donationDrives = new Map();
    this.donations = new Map();
    this.activities = new Map();

    this.currentId = {
      users: 1,
      donors: 1,
      recipients: 1,
      hospitals: 1,
      bloodInventory: 1,
      bloodRequests: 1,
      donationDrives: 1,
      donations: 1,
      activities: 1,
    };

    // Add sample data
    this.initializeData();
  }

  // Users methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Donors methods
  async getDonors(): Promise<Donor[]> {
    return Array.from(this.donors.values());
  }

  async getDonor(id: number): Promise<Donor | undefined> {
    return this.donors.get(id);
  }

  async getDonorByDonorId(donorId: string): Promise<Donor | undefined> {
    return Array.from(this.donors.values()).find(
      (donor) => donor.donor_id === donorId,
    );
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    const id = this.currentId.donors++;
    const createdAt = new Date();
    const donor: Donor = { ...insertDonor, id, createdAt };
    this.donors.set(id, donor);
    return donor;
  }

  async updateDonor(id: number, donor: Partial<InsertDonor>): Promise<Donor | undefined> {
    const existingDonor = this.donors.get(id);
    if (!existingDonor) return undefined;

    const updatedDonor = { ...existingDonor, ...donor };
    this.donors.set(id, updatedDonor);
    return updatedDonor;
  }

  // Recipients methods
  async getRecipients(): Promise<Recipient[]> {
    return Array.from(this.recipients.values());
  }

  async getRecipient(id: number): Promise<Recipient | undefined> {
    return this.recipients.get(id);
  }

  async getRecipientByRecipientId(recipientId: string): Promise<Recipient | undefined> {
    return Array.from(this.recipients.values()).find(
      (recipient) => recipient.recipient_id === recipientId,
    );
  }

  async createRecipient(insertRecipient: InsertRecipient): Promise<Recipient> {
    const id = this.currentId.recipients++;
    const createdAt = new Date();
    const recipient: Recipient = { ...insertRecipient, id, createdAt };
    this.recipients.set(id, recipient);
    return recipient;
  }

  async updateRecipient(id: number, recipient: Partial<InsertRecipient>): Promise<Recipient | undefined> {
    const existingRecipient = this.recipients.get(id);
    if (!existingRecipient) return undefined;

    const updatedRecipient = { ...existingRecipient, ...recipient };
    this.recipients.set(id, updatedRecipient);
    return updatedRecipient;
  }

  // Hospitals methods
  async getHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }

  async getHospital(id: number): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const id = this.currentId.hospitals++;
    const createdAt = new Date();
    const hospital: Hospital = { ...insertHospital, id, createdAt };
    this.hospitals.set(id, hospital);
    return hospital;
  }

  // Blood Inventory methods
  async getBloodInventory(): Promise<BloodInventory[]> {
    return Array.from(this.bloodInventory.values());
  }

  async getBloodInventoryByType(bloodType: string): Promise<BloodInventory[]> {
    return Array.from(this.bloodInventory.values()).filter(
      (inventory) => inventory.blood_type === bloodType
    );
  }

  async getBloodInventorySummary(): Promise<{
    blood_type: string;
    units: number;
    status: "adequate" | "moderate" | "critical";
    threshold: number;
    expiring_soon: number;
  }[]> {
    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const inventory = Array.from(this.bloodInventory.values());
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);

    return bloodTypes.map(bloodType => {
      const filteredInventory = inventory.filter(
        item => item.blood_type === bloodType && item.status === 'completed'
      );
      
      const units = filteredInventory.reduce((sum, item) => sum + item.units, 0);
      const threshold = bloodType.includes('O') ? 40 : bloodType.includes('A') ? 30 : 20;
      
      const expiringSoon = filteredInventory.filter(
        item => {
          const expiryDate = new Date(item.expiry_date);
          return expiryDate <= twoWeeksFromNow;
        }
      ).reduce((sum, item) => sum + item.units, 0);
      
      let status: "adequate" | "moderate" | "critical";
      const percentage = (units / threshold) * 100;
      
      if (percentage >= 70) {
        status = "adequate";
      } else if (percentage >= 40) {
        status = "moderate";
      } else {
        status = "critical";
      }
      
      return {
        blood_type: bloodType,
        units,
        status,
        threshold,
        expiring_soon: expiringSoon
      };
    });
  }

  async createBloodInventory(insertInventory: InsertBloodInventory): Promise<BloodInventory> {
    const id = this.currentId.bloodInventory++;
    const createdAt = new Date();
    const inventory: BloodInventory = { ...insertInventory, id, createdAt };
    this.bloodInventory.set(id, inventory);
    return inventory;
  }

  async updateBloodInventory(id: number, inventory: Partial<InsertBloodInventory>): Promise<BloodInventory | undefined> {
    const existingInventory = this.bloodInventory.get(id);
    if (!existingInventory) return undefined;

    const updatedInventory = { ...existingInventory, ...inventory };
    this.bloodInventory.set(id, updatedInventory);
    return updatedInventory;
  }

  // Blood Requests methods
  async getBloodRequests(): Promise<BloodRequest[]> {
    return Array.from(this.bloodRequests.values());
  }

  async getBloodRequestById(id: number): Promise<BloodRequest | undefined> {
    return this.bloodRequests.get(id);
  }

  async createBloodRequest(insertRequest: InsertBloodRequest): Promise<BloodRequest> {
    const id = this.currentId.bloodRequests++;
    const createdAt = new Date();
    const request_id = `REQ-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`;
    const request: BloodRequest = { ...insertRequest, id, request_id, createdAt };
    this.bloodRequests.set(id, request);
    return request;
  }

  async updateBloodRequest(id: number, request: Partial<InsertBloodRequest>): Promise<BloodRequest | undefined> {
    const existingRequest = this.bloodRequests.get(id);
    if (!existingRequest) return undefined;

    const updatedRequest = { ...existingRequest, ...request };
    this.bloodRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Donation Drives methods
  async getDonationDrives(): Promise<DonationDrive[]> {
    return Array.from(this.donationDrives.values());
  }

  async getUpcomingDonationDrives(limit?: number): Promise<DonationDrive[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingDrives = Array.from(this.donationDrives.values())
      .filter(drive => {
        const driveDate = new Date(drive.date);
        return driveDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return limit ? upcomingDrives.slice(0, limit) : upcomingDrives;
  }

  async getDonationDrive(id: number): Promise<DonationDrive | undefined> {
    return this.donationDrives.get(id);
  }

  async createDonationDrive(insertDrive: InsertDonationDrive): Promise<DonationDrive> {
    const id = this.currentId.donationDrives++;
    const createdAt = new Date();
    const drive: DonationDrive = { ...insertDrive, id, createdAt };
    this.donationDrives.set(id, drive);
    return drive;
  }

  async updateDonationDrive(id: number, drive: Partial<InsertDonationDrive>): Promise<DonationDrive | undefined> {
    const existingDrive = this.donationDrives.get(id);
    if (!existingDrive) return undefined;

    const updatedDrive = { ...existingDrive, ...drive };
    this.donationDrives.set(id, updatedDrive);
    return updatedDrive;
  }

  // Donations methods
  async getDonations(): Promise<Donation[]> {
    return Array.from(this.donations.values());
  }

  async getDonation(id: number): Promise<Donation | undefined> {
    return this.donations.get(id);
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.currentId.donations++;
    const createdAt = new Date();
    const donation: Donation = { ...insertDonation, id, createdAt };
    this.donations.set(id, donation);
    return donation;
  }

  async updateDonation(id: number, donationUpdate: Partial<InsertDonation>): Promise<Donation | undefined> {
    const donation = this.donations.get(id);
    if (!donation) {
      return undefined;
    }
    const updatedDonation: Donation = { ...donation, ...donationUpdate };
    this.donations.set(id, updatedDonation);
    return updatedDonation;
  }

  // Activities methods
  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId.activities++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }

  // Initialize with sample data
  private initializeData() {
    // Sample admin user
    this.createUser({
      username: "admin",
      password: "password", // In a real app, this would be hashed
      name: "Admin User",
      email: "admin@bloodbank.com",
      role: "admin",
      hospital_id: null
    });

    // Sample staff user
    this.createUser({
      username: "staff",
      password: "password",
      name: "Staff User",
      email: "staff@bloodbank.com",
      role: "staff",
      hospital_id: null
    });

    // Sample hospital user
    this.createUser({
      username: "hospital",
      password: "password",
      name: "Hospital User",
      email: "hospital@memorial.com",
      role: "hospital",
      hospital_id: 1
    });

    // Sample hospitals
    this.createHospital({
      name: "Memorial Hospital",
      address: "123 Main St, Anytown, USA",
      phone: "555-123-4567",
      email: "info@memorial.com",
      contact_person: "Dr. Smith"
    });

    this.createHospital({
      name: "City General Hospital",
      address: "456 Oak Ave, Anytown, USA",
      phone: "555-789-0123",
      email: "info@citygeneral.com",
      contact_person: "Dr. Johnson"
    });

    this.createHospital({
      name: "Westside Medical Center",
      address: "789 Elm St, Anytown, USA",
      phone: "555-456-7890",
      email: "info@westside.com",
      contact_person: "Dr. Williams"
    });

    // Sample donors
    this.createDonor({
      donor_id: "DON-2023-1254",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "555-111-2222",
      blood_type: "O+",
      gender: "male",
      dob: new Date("1985-04-12"),
      address: "234 Pine St, Anytown, USA",
      medical_conditions: "",
      last_donation: new Date("2023-05-02"),
      eligible_to_donate: true
    });

    this.createDonor({
      donor_id: "DON-2023-1253",
      name: "Alice Wong",
      email: "alice.wong@example.com",
      phone: "555-333-4444",
      blood_type: "A+",
      gender: "female",
      dob: new Date("1990-08-25"),
      address: "567 Maple Ave, Anytown, USA",
      medical_conditions: "None",
      last_donation: new Date("2023-05-01"),
      eligible_to_donate: true
    });

    // Sample recipients
    this.createRecipient({
      recipient_id: "REC-2023-0892",
      name: "Sarah Miller",
      blood_type: "AB-",
      gender: "female",
      dob: new Date("1977-12-15"),
      address: "890 Cedar Rd, Anytown, USA",
      medical_requirements: "Emergency surgery",
      hospital_id: 1
    });

    // Sample blood inventory
    const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const today = new Date();
    
    // Add inventory for each blood type
    bloodTypes.forEach((bloodType, index) => {
      const unitsBase = {
        "A+": 52,
        "A-": 25,
        "B+": 36,
        "B-": 20,
        "AB+": 18,
        "AB-": 12,
        "O+": 48,
        "O-": 8
      }[bloodType] || 20;
      
      // Create inventory with different donation dates
      for (let i = 0; i < 5; i++) {
        const donationDate = new Date();
        donationDate.setDate(today.getDate() - (i * 10) - Math.floor(Math.random() * 5));
        
        const expiryDate = new Date(donationDate);
        expiryDate.setDate(donationDate.getDate() + 42); // Blood typically expires after 42 days
        
        this.createBloodInventory({
          blood_type: bloodType as any,
          units: Math.floor(unitsBase / 5) + Math.floor(Math.random() * 3),
          donation_date: donationDate,
          expiry_date: expiryDate,
          donor_id: Math.random() > 0.5 ? 1 : 2,
          status: "completed"
        });
      }
    });

    // Sample blood requests
    this.createBloodRequest({
      request_id: "REQ-2023-0458",
      hospital_id: 1,
      blood_type: "O-",
      units_needed: 5,
      required_by: new Date("2023-05-03"),
      reason: "Needed for emergency surgery. Patient with severe trauma.",
      status: "urgent"
    });

    this.createBloodRequest({
      request_id: "REQ-2023-0457",
      hospital_id: 2,
      blood_type: "A+",
      units_needed: 3,
      required_by: new Date("2023-05-05"),
      reason: "Scheduled surgeries for the coming week.",
      status: "pending"
    });

    this.createBloodRequest({
      request_id: "REQ-2023-0456",
      hospital_id: 3,
      blood_type: "B+",
      units_needed: 2,
      required_by: new Date("2023-05-06"),
      reason: "Regular inventory replenishment.",
      status: "pending"
    });

    // Sample donation drives
    this.createDonationDrive({
      title: "Community Blood Drive at Central Park",
      location: "123 Main Street, Central Park Community Center",
      date: new Date("2023-05-05"),
      start_time: "9:00 AM",
      end_time: "5:00 PM",
      target_units: 50,
      registrations: 32,
      description: "Join us for our community blood drive. Refreshments will be provided."
    });

    this.createDonationDrive({
      title: "Corporate Drive at Tech Solutions Inc.",
      location: "456 Innovation Drive, Tech Solutions Building",
      date: new Date("2023-05-10"),
      start_time: "10:00 AM",
      end_time: "3:00 PM",
      target_units: 30,
      registrations: 18,
      description: "Tech Solutions is hosting a blood drive for employees and the public."
    });

    this.createDonationDrive({
      title: "University Campus Drive",
      location: "State University, Student Union Building",
      date: new Date("2023-05-15"),
      start_time: "11:00 AM",
      end_time: "6:00 PM",
      target_units: 75,
      registrations: 42,
      description: "The university's annual blood drive. Students get volunteer hours."
    });

    // Sample donations
    this.createDonation({
      donor_id: 1,
      date: new Date("2023-05-02"),
      blood_type: "O+",
      units: 1,
      status: "completed",
      notes: "Successful donation",
      drive_id: null,
      inventory_id: 1
    });

    this.createDonation({
      donor_id: 2,
      date: new Date("2023-05-01"),
      blood_type: "A+",
      units: 1,
      status: "completed",
      notes: "Successful donation",
      drive_id: null,
      inventory_id: 2
    });

    // Sample activities
    this.createActivity({
      activity_type: "Blood Donation",
      description: "John Doe donated blood",
      user_id: 2,
      related_id: 1,
      date: new Date("2023-05-02")
    });

    this.createActivity({
      activity_type: "Blood Request",
      description: "Sarah Miller requested blood",
      user_id: 3,
      related_id: 1,
      date: new Date("2023-05-02")
    });

    this.createActivity({
      activity_type: "Emergency Request",
      description: "Memorial City Hospital requested O- blood",
      user_id: 3,
      related_id: 1,
      date: new Date("2023-05-01")
    });

    this.createActivity({
      activity_type: "Blood Donation",
      description: "Alice Wong donated blood",
      user_id: 2,
      related_id: 2,
      date: new Date("2023-05-01")
    });
  }
}

export const storage = new MemStorage();
