export interface Plot {
  id: string
  plotId: string
  size: string
  price: number
  status: "Available" | "Reserved" | "Sold"
}

export interface Document {
  name: string
  fileSize: string
  fileType: string
  url: string
}

export interface Property {
  id: string
  title: string
  description: string
  location: string
  price: number
  plotSize: string
  totalPlots: number
  availablePlots: number
  type: "Land" | "Residential" | "Commercial"
  status: "Available" | "Sold Out" | "Coming Soon"
  featured: boolean
  amenities: string[]
  plots: Plot[]
  images: string[]
  layoutImage?: string
  documents: Document[]
  createdAt: string
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "IVY GOLD ESTATE ABUJA (PHASE 3)",
    description:
      "Ivy Gold Estate is a premium residential development located in the heart of Abuja. The estate offers a serene environment with modern infrastructure and amenities. Phase 3 of the development features spacious plots ideal for building your dream home.",
    location: "Abuja, Nigeria",
    price: 5000000,
    plotSize: "250",
    totalPlots: 20,
    availablePlots: 5,
    type: "Land",
    status: "Available",
    featured: true,
    amenities: ["Electricity", "Road Access", "Security", "Water", "Drainage System", "Perimeter Fencing"],
    plots: [
      {
        id: "p1",
        plotId: "IVG3 TD-02",
        size: "250",
        price: 5000000,
        status: "Available",
      },
      {
        id: "p2",
        plotId: "IVG3 TD-03",
        size: "250",
        price: 5000000,
        status: "Available",
      },
      {
        id: "p3",
        plotId: "IVG3 TD-04",
        size: "250",
        price: 5000000,
        status: "Available",
      },
      {
        id: "p4",
        plotId: "IVG3 TD-05",
        size: "250",
        price: 5000000,
        status: "Available",
      },
      {
        id: "p5",
        plotId: "IVG3 TD-06",
        size: "250",
        price: 5000000,
        status: "Available",
      },
    ],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    layoutImage: "/placeholder.svg?height=800&width=1200",
    documents: [
      {
        name: "Estate Layout Plan",
        fileSize: "2.5 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Property Certificate",
        fileSize: "1.2 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Development Plan",
        fileSize: "3.7 MB",
        fileType: "PDF",
        url: "#",
      },
    ],
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    title: "ROYAL GARDENS ESTATE LAGOS",
    description:
      "Royal Gardens Estate is a luxurious residential development in Lagos offering premium plots for building your dream home. The estate features modern infrastructure, 24/7 security, and a serene environment perfect for family living.",
    location: "Lagos, Nigeria",
    price: 7500000,
    plotSize: "300",
    totalPlots: 15,
    availablePlots: 8,
    type: "Land",
    status: "Available",
    featured: true,
    amenities: [
      "Electricity",
      "Road Access",
      "Security",
      "Water",
      "Drainage System",
      "Recreational Areas",
      "Shopping Centers",
    ],
    plots: [
      {
        id: "p6",
        plotId: "RGE-A01",
        size: "300",
        price: 7500000,
        status: "Available",
      },
      {
        id: "p7",
        plotId: "RGE-A02",
        size: "300",
        price: 7500000,
        status: "Available",
      },
      {
        id: "p8",
        plotId: "RGE-A03",
        size: "300",
        price: 7500000,
        status: "Available",
      },
      {
        id: "p9",
        plotId: "RGE-B01",
        size: "300",
        price: 7500000,
        status: "Available",
      },
      {
        id: "p10",
        plotId: "RGE-B02",
        size: "300",
        price: 7500000,
        status: "Available",
      },
      {
        id: "p11",
        plotId: "RGE-B03",
        size: "300",
        price: 7500000,
        status: "Available",
      },
      {
        id: "p12",
        plotId: "RGE-C01",
        size: "300",
        price: 7500000,
        status: "Available",
      },
      {
        id: "p13",
        plotId: "RGE-C02",
        size: "300",
        price: 7500000,
        status: "Available",
      },
    ],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    layoutImage: "/placeholder.svg?height=800&width=1200",
    documents: [
      {
        name: "Estate Layout Plan",
        fileSize: "3.1 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Property Certificate",
        fileSize: "1.5 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Development Plan",
        fileSize: "2.8 MB",
        fileType: "PDF",
        url: "#",
      },
    ],
    createdAt: "2023-06-22T14:45:00Z",
  },
  {
    id: "3",
    title: "PEARL CITY PORT HARCOURT",
    description:
      "Pearl City is a premium waterfront development in Port Harcourt offering residential plots with stunning views. The development features modern infrastructure, recreational facilities, and a secure environment for family living.",
    location: "Port Harcourt, Nigeria",
    price: 6500000,
    plotSize: "400",
    totalPlots: 25,
    availablePlots: 12,
    type: "Land",
    status: "Available",
    featured: false,
    amenities: [
      "Electricity",
      "Road Access",
      "Security",
      "Water",
      "Drainage System",
      "Recreational Areas",
      "Waterfront Access",
    ],
    plots: [
      {
        id: "p14",
        plotId: "PC-W01",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p15",
        plotId: "PC-W02",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p16",
        plotId: "PC-W03",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p17",
        plotId: "PC-W04",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p18",
        plotId: "PC-W05",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p19",
        plotId: "PC-W06",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p20",
        plotId: "PC-W07",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p21",
        plotId: "PC-W08",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p22",
        plotId: "PC-W09",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p23",
        plotId: "PC-W10",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p24",
        plotId: "PC-W11",
        size: "400",
        price: 6500000,
        status: "Available",
      },
      {
        id: "p25",
        plotId: "PC-W12",
        size: "400",
        price: 6500000,
        status: "Available",
      },
    ],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    layoutImage: "/placeholder.svg?height=800&width=1200",
    documents: [
      {
        name: "Estate Layout Plan",
        fileSize: "4.2 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Property Certificate",
        fileSize: "1.8 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Development Plan",
        fileSize: "3.5 MB",
        fileType: "PDF",
        url: "#",
      },
    ],
    createdAt: "2023-07-10T09:15:00Z",
  },
  {
    id: "4",
    title: "EMERALD HEIGHTS ABUJA",
    description:
      "Emerald Heights is an exclusive residential development in Abuja offering premium plots in a secure and serene environment. The development features modern infrastructure, recreational facilities, and is located close to major amenities.",
    location: "Abuja, Nigeria",
    price: 8500000,
    plotSize: "500",
    totalPlots: 10,
    availablePlots: 3,
    type: "Land",
    status: "Available",
    featured: true,
    amenities: [
      "Electricity",
      "Road Access",
      "Security",
      "Water",
      "Drainage System",
      "Recreational Areas",
      "Shopping Centers",
      "Schools",
      "Hospitals",
    ],
    plots: [
      {
        id: "p26",
        plotId: "EH-P01",
        size: "500",
        price: 8500000,
        status: "Available",
      },
      {
        id: "p27",
        plotId: "EH-P02",
        size: "500",
        price: 8500000,
        status: "Available",
      },
      {
        id: "p28",
        plotId: "EH-P03",
        size: "500",
        price: 8500000,
        status: "Available",
      },
    ],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    layoutImage: "/placeholder.svg?height=800&width=1200",
    documents: [
      {
        name: "Estate Layout Plan",
        fileSize: "3.8 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Property Certificate",
        fileSize: "2.1 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Development Plan",
        fileSize: "4.5 MB",
        fileType: "PDF",
        url: "#",
      },
    ],
    createdAt: "2023-08-05T11:20:00Z",
  },
  {
    id: "5",
    title: "SAPPHIRE GARDENS LAGOS",
    description:
      "Sapphire Gardens is a premium residential development in Lagos offering spacious plots for building your dream home. The estate features modern infrastructure, 24/7 security, and is located in a serene environment with easy access to major highways.",
    location: "Lagos, Nigeria",
    price: 9000000,
    plotSize: "600",
    totalPlots: 8,
    availablePlots: 2,
    type: "Land",
    status: "Available",
    featured: false,
    amenities: [
      "Electricity",
      "Road Access",
      "Security",
      "Water",
      "Drainage System",
      "Recreational Areas",
      "Shopping Centers",
      "Schools",
    ],
    plots: [
      {
        id: "p29",
        plotId: "SG-L01",
        size: "600",
        price: 9000000,
        status: "Available",
      },
      {
        id: "p30",
        plotId: "SG-L02",
        size: "600",
        price: 9000000,
        status: "Available",
      },
    ],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    layoutImage: "/placeholder.svg?height=800&width=1200",
    documents: [
      {
        name: "Estate Layout Plan",
        fileSize: "4.0 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Property Certificate",
        fileSize: "2.3 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Development Plan",
        fileSize: "3.9 MB",
        fileType: "PDF",
        url: "#",
      },
    ],
    createdAt: "2023-09-18T13:40:00Z",
  },
  {
    id: "6",
    title: "DIAMOND VALLEY PORT HARCOURT",
    description:
      "Diamond Valley is a premium residential development in Port Harcourt offering spacious plots in a secure and serene environment. The development features modern infrastructure, recreational facilities, and is located close to major amenities.",
    location: "Port Harcourt, Nigeria",
    price: 7000000,
    plotSize: "450",
    totalPlots: 15,
    availablePlots: 6,
    type: "Land",
    status: "Available",
    featured: true,
    amenities: ["Electricity", "Road Access", "Security", "Water", "Drainage System", "Recreational Areas"],
    plots: [
      {
        id: "p31",
        plotId: "DV-A01",
        size: "450",
        price: 7000000,
        status: "Available",
      },
      {
        id: "p32",
        plotId: "DV-A02",
        size: "450",
        price: 7000000,
        status: "Available",
      },
      {
        id: "p33",
        plotId: "DV-A03",
        size: "450",
        price: 7000000,
        status: "Available",
      },
      {
        id: "p34",
        plotId: "DV-B01",
        size: "450",
        price: 7000000,
        status: "Available",
      },
      {
        id: "p35",
        plotId: "DV-B02",
        size: "450",
        price: 7000000,
        status: "Available",
      },
      {
        id: "p36",
        plotId: "DV-B03",
        size: "450",
        price: 7000000,
        status: "Available",
      },
    ],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    layoutImage: "/placeholder.svg?height=800&width=1200",
    documents: [
      {
        name: "Estate Layout Plan",
        fileSize: "3.5 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Property Certificate",
        fileSize: "1.9 MB",
        fileType: "PDF",
        url: "#",
      },
      {
        name: "Development Plan",
        fileSize: "3.2 MB",
        fileType: "PDF",
        url: "#",
      },
    ],
    createdAt: "2023-10-25T15:30:00Z",
  },
]

// Mock Users
export const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "buyer",
    status: "active",
    verified: true,
    joinDate: "2023-01-15",
    lastActive: "2023-06-20",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    transactions: 12,
    properties: 3,
    walletBalance: 5200,
    companyId: "company-1",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "agent",
    status: "active",
    verified: true,
    joinDate: "2023-02-10",
    lastActive: "2023-06-18",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tYW58ZW58MHx8MHx8fDA%3D",
    transactions: 28,
    properties: 15,
    walletBalance: 12500,
    companyId: "company-2",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "buyer",
    status: "suspended",
    verified: true,
    joinDate: "2023-03-05",
    lastActive: "2023-05-30",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    transactions: 5,
    properties: 1,
    walletBalance: 800,
    companyId: null,
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "agent",
    status: "blacklisted",
    verified: false,
    joinDate: "2023-04-20",
    lastActive: "2023-06-01",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tYW58ZW58MHx8MHx8fDA%3D",
    transactions: 0,
    properties: 0,
    walletBalance: 0,
    companyId: "company-3",
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "buyer",
    status: "active",
    verified: true,
    joinDate: "2023-05-12",
    lastActive: "2023-06-19",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bWFufGVufDB8fDB8fHww",
    transactions: 8,
    properties: 2,
    walletBalance: 3400,
    companyId: "company-1",
  },
]

// Mock Admins
export const mockAdmins = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@esthington.com",
    role: "super_admin",
    status: "active",
    joinDate: "2022-05-10",
    lastActive: "2023-06-20",
    avatar:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    permissions: ["all"],
    activityLog: [
      { action: "User blacklisted", timestamp: "2023-06-19 14:30", target: "Emily Davis" },
      { action: "Property approved", timestamp: "2023-06-18 10:15", target: "Luxury Villa #1242" },
      { action: "System settings updated", timestamp: "2023-06-15 09:45", target: "Payment Gateway" },
    ],
  },
  {
    id: "2",
    name: "Sarah Williams",
    email: "sarah.williams@esthington.com",
    role: "admin",
    status: "active",
    joinDate: "2022-08-15",
    lastActive: "2023-06-19",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHdvbWFufGVufDB8fDB8fHww",
    permissions: ["users_manage", "properties_manage", "transactions_view"],
    activityLog: [
      { action: "User approved", timestamp: "2023-06-19 11:20", target: "Michael Brown" },
      { action: "Property edited", timestamp: "2023-06-17 15:30", target: "Beachfront Condo #876" },
    ],
  },
  {
    id: "3",
    name: "David Chen",
    email: "david.chen@esthington.com",
    role: "admin",
    status: "suspended",
    joinDate: "2022-10-05",
    lastActive: "2023-06-01",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFufGVufDB8fDB8fHww",
    permissions: ["properties_manage", "transactions_view"],
    activityLog: [
      { action: "Property rejected", timestamp: "2023-06-01 09:10", target: "Downtown Apartment #433" },
      { action: "Failed login attempt", timestamp: "2023-06-01 08:45", target: "System" },
    ],
  },
]

// Mock Transactions
export const mockTransactions = [
  {
    id: "TX-12345",
    type: "purchase",
    amount: 25000,
    status: "completed",
    date: "2023-06-20",
    time: "14:30:25",
    user: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    },
    property: {
      id: "P-789",
      title: "Luxury Villa",
      location: "Miami, FL",
    },
    paymentMethod: "credit_card",
    reference: "REF-98765",
  },
  {
    id: "TX-12346",
    type: "investment",
    amount: 50000,
    status: "completed",
    date: "2023-06-19",
    time: "10:15:42",
    user: {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tYW58ZW58MHx8MHx8fDA%3D",
    },
    property: {
      id: "P-456",
      title: "Beachfront Condo",
      location: "San Diego, CA",
    },
    paymentMethod: "bank_transfer",
    reference: "REF-98766",
  },
  {
    id: "TX-12347",
    type: "withdrawal",
    amount: 15000,
    status: "pending",
    date: "2023-06-18",
    time: "16:45:10",
    user: {
      id: "3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    },
    property: null,
    paymentMethod: "bank_transfer",
    reference: "REF-98767",
  },
  {
    id: "TX-12348",
    type: "deposit",
    amount: 30000,
    status: "completed",
    date: "2023-06-17",
    time: "09:30:55",
    user: {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tYW58ZW58MHx8MHx8fDA%3D",
    },
    property: null,
    paymentMethod: "credit_card",
    reference: "REF-98768",
  },
  {
    id: "TX-12349",
    type: "purchase",
    amount: 45000,
    status: "failed",
    date: "2023-06-16",
    time: "11:20:30",
    user: {
      id: "5",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bWFufGVufDB8fDB8fHww",
    },
    property: {
      id: "P-123",
      title: "Downtown Apartment",
      location: "New York, NY",
    },
    paymentMethod: "credit_card",
    reference: "REF-98769",
  },
]

// Mock Approvals
export const mockApprovals = [
  {
    id: "AP-12345",
    type: "property",
    title: "Luxury Villa",
    description: "New property listing for approval",
    status: "pending",
    date: "2023-06-20",
    time: "14:30:25",
    user: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    },
    details: {
      location: "Miami, FL",
      price: 1250000,
      images: 5,
      documents: 2,
    },
  },
  {
    id: "AP-12346",
    type: "withdrawal",
    title: "$15,000 Withdrawal Request",
    description: "User requesting to withdraw funds",
    status: "pending",
    date: "2023-06-19",
    time: "10:15:42",
    user: {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tYW58ZW58MHx8MHx8fDA%3D",
    },
    details: {
      amount: 15000,
      bankAccount: "****4567",
      reason: "Investment returns",
    },
  },
  {
    id: "AP-12347",
    type: "kyc",
    title: "KYC Verification",
    description: "User submitted KYC documents for verification",
    status: "pending",
    date: "2023-06-18",
    time: "16:45:10",
    user: {
      id: "3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hbnxlbnwwfHwwfHx8MA%3D%3D",
    },
    details: {
      documentType: "ID Card",
      documentNumber: "ID-78901234",
      documentExpiry: "2025-10-15",
    },
  },
  {
    id: "AP-12348",
    type: "property",
    title: "Beachfront Condo",
    description: "New property listing for approval",
    status: "approved",
    date: "2023-06-17",
    time: "09:30:55",
    user: {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tYW58ZW58MHx8MHx8fDA%3D",
    },
    details: {
      location: "San Diego, CA",
      price: 850000,
      images: 8,
      documents: 3,
    },
  },
  {
    id: "AP-12349",
    type: "withdrawal",
    title: "$5,000 Withdrawal Request",
    description: "User requesting to withdraw funds",
    status: "rejected",
    date: "2023-06-16",
    time: "11:20:30",
    user: {
      id: "5",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bWFufGVufDB8fDB8fHww",
    },
    details: {
      amount: 5000,
      bankAccount: "****7890",
      reason: "Personal use",
    },
  },
]

// Mock Report Data
export const mockReportData = {
  salesData: [
    { name: "Jan", properties: 65, investments: 45 },
    { name: "Feb", properties: 59, investments: 49 },
    { name: "Mar", properties: 80, investments: 90 },
    { name: "Apr", properties: 81, investments: 39 },
    { name: "May", properties: 56, investments: 85 },
    { name: "Jun", properties: 55, investments: 53 },
    { name: "Jul", properties: 40, investments: 49 },
    { name: "Aug", properties: 45, investments: 56 },
    { name: "Sep", properties: 67, investments: 65 },
    { name: "Oct", properties: 60, investments: 70 },
    { name: "Nov", properties: 71, investments: 68 },
    { name: "Dec", properties: 65, investments: 75 },
  ],
  userActivityData: [
    { name: "Week 1", active: 400, new: 240 },
    { name: "Week 2", active: 300, new: 139 },
    { name: "Week 3", active: 200, new: 980 },
    { name: "Week 4", active: 278, new: 390 },
    { name: "Week 5", active: 189, new: 480 },
  ],
  transactionTypeData: [
    { name: "Purchases", value: 400 },
    { name: "Investments", value: 300 },
    { name: "Withdrawals", value: 300 },
    { name: "Deposits", value: 200 },
  ],
  propertyTypeData: [
    { name: "Residential", value: 35 },
    { name: "Commercial", value: 25 },
    { name: "Industrial", value: 15 },
    { name: "Land", value: 25 },
  ],
  totalRevenue: 1245890,
  totalUsers: 8642,
  totalProperties: 1024,
}
