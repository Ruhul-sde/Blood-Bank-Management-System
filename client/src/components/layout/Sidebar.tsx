import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Package2, 
  Calendar, 
  Building, 
  FileText, 
  BarChart3,
  FileBarChart, 
  Settings, 
  HelpCircle 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Define sidebar menu items
  const menuItems = [
    { 
      section: "Management",
      items: [
        { 
          name: "Dashboard", 
          path: "/", 
          icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff", "hospital"] 
        },
        { 
          name: "Donors", 
          path: "/donors", 
          icon: <Users className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff"] 
        },
        { 
          name: "Recipients", 
          path: "/recipients", 
          icon: <UserPlus className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff", "hospital"] 
        },
        { 
          name: "Inventory", 
          path: "/inventory", 
          icon: <Package2 className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff"] 
        },
        { 
          name: "Donations", 
          path: "/donations", 
          icon: <Calendar className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff"] 
        },
      ]
    },
    {
      section: "Communication",
      items: [
        { 
          name: "Hospitals", 
          path: "/hospitals", 
          icon: <Building className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff"] 
        },
        { 
          name: "Requests", 
          path: "/requests", 
          icon: <FileText className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff", "hospital"] 
        },
      ]
    },
    {
      section: "Reports",
      items: [
        { 
          name: "Analytics", 
          path: "/analytics", 
          icon: <BarChart3 className="mr-3 h-5 w-5" />,
          roles: ["admin"] 
        },
        { 
          name: "Reports", 
          path: "/reports", 
          icon: <FileBarChart className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff"] 
        },
      ]
    },
    {
      section: "Settings",
      items: [
        { 
          name: "Settings", 
          path: "/settings", 
          icon: <Settings className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff", "hospital"] 
        },
        { 
          name: "Help Center", 
          path: "/help", 
          icon: <HelpCircle className="mr-3 h-5 w-5" />,
          roles: ["admin", "staff", "hospital"] 
        },
      ]
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => 
      user?.role && item.roles.includes(user.role)
    )
  })).filter(section => section.items.length > 0);

  return (
    <aside 
      className={cn(
        "w-64 bg-white shadow-lg h-screen fixed lg:relative z-10 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <nav className="py-4 h-full flex flex-col">
        <div className="px-4 mb-6">
          <Link href="/">
            <a className={cn(
              "flex items-center px-4 py-2 rounded-lg",
              location === "/" ? "bg-red-50 text-primary" : "text-gray-600 hover:bg-red-50 hover:text-primary"
            )}>
              <LayoutDashboard className="mr-3 h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </a>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMenuItems.map((section, idx) => (
            <div className="mb-4" key={idx}>
              <h3 className="sidebar-heading">{section.section}</h3>
              <div className="mt-2">
                {section.items.map((item, itemIdx) => (
                  <Link href={item.path} key={itemIdx}>
                    <a className={cn(
                      "sidebar-item",
                      location === item.path && "sidebar-active"
                    )}>
                      {item.icon}
                      <span>{item.name}</span>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
