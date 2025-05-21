import { cn } from "@/lib/utils";

interface InventoryCardProps {
  bloodType: string;
  units: number;
  status: "adequate" | "moderate" | "critical";
  threshold: number;
  expiringUnits: number;
}

export default function InventoryCard({
  bloodType,
  units,
  status,
  threshold,
  expiringUnits
}: InventoryCardProps) {
  const getStatusBadge = () => {
    const statusConfig = {
      adequate: {
        bg: "bg-green-100",
        text: "text-success",
        label: "Adequate"
      },
      moderate: {
        bg: "bg-amber-100",
        text: "text-warning",
        label: "Moderate"
      },
      critical: {
        bg: "bg-red-100",
        text: "text-primary",
        label: "Critical"
      }
    };

    const config = statusConfig[status];
    
    return (
      <div className={`${config.bg} ${config.text} px-2 py-1 rounded text-xs font-medium`}>
        {config.label}
      </div>
    );
  };

  const getProgressColor = () => {
    const colorConfig = {
      adequate: "bg-success",
      moderate: "bg-warning",
      critical: "bg-primary"
    };
    
    return colorConfig[status];
  };

  const getProgressWidth = () => {
    const percentage = (units / threshold) * 100;
    return `${Math.min(percentage, 100)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-3xl font-bold text-gray-800">{bloodType}</span>
          <p className="text-sm text-gray-600 mt-1">Blood Type</p>
        </div>
        {getStatusBadge()}
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Units Available</span>
          <span className="text-sm font-medium text-gray-800">{units} units</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={cn("h-2.5 rounded-full", getProgressColor())} 
            style={{ width: getProgressWidth() }}
          ></div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Expires in 14 days: {expiringUnits} units</span>
        <span>Threshold: {threshold} units</span>
      </div>
    </div>
  );
}
