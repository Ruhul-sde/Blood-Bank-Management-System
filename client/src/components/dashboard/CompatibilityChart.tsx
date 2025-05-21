import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CompatibilityChart() {
  // Blood compatibility data
  const compatibilityData = [
    { type: "A+", canDonateTo: "A+, AB+", canReceiveFrom: "A+, A-, O+, O-" },
    { type: "O-", canDonateTo: "All Blood Types", canReceiveFrom: "O-" },
    { type: "B+", canDonateTo: "B+, AB+", canReceiveFrom: "B+, B-, O+, O-" },
    { type: "AB+", canDonateTo: "AB+ only", canReceiveFrom: "All Blood Types" },
  ];

  // Facts about blood types
  const bloodFacts = [
    "Type O- is the universal donor",
    "Type AB+ is the universal recipient",
    "Most common blood type is O+",
    "Rarest blood type is AB-"
  ];

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Blood Type Compatibility Chart
          </CardTitle>
          <Button variant="link" className="text-secondary p-0 h-auto font-normal">
            Learn More
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {/* Blood compatibility chart diagram */}
        <div className="bg-neutral p-3 rounded-md mb-4 flex items-center justify-center">
          <svg width="100%" height="180" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
            {/* Blood compatibility diagram */}
            <g transform="translate(400, 200)">
              {/* A+ Circle */}
              <circle cx="-120" cy="-80" r="60" fill="#E53935" fillOpacity="0.2" stroke="#E53935" strokeWidth="2" />
              <text x="-120" y="-75" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#333">A+</text>
              
              {/* B+ Circle */}
              <circle cx="120" cy="-80" r="60" fill="#2196F3" fillOpacity="0.2" stroke="#2196F3" strokeWidth="2" />
              <text x="120" y="-75" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#333">B+</text>
              
              {/* O+ Circle */}
              <circle cx="0" cy="0" r="60" fill="#FFC107" fillOpacity="0.2" stroke="#FFC107" strokeWidth="2" />
              <text x="0" y="5" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#333">O+</text>
              
              {/* AB+ Circle */}
              <circle cx="0" cy="-150" r="60" fill="#4CAF50" fillOpacity="0.2" stroke="#4CAF50" strokeWidth="2" />
              <text x="0" y="-145" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#333">AB+</text>
              
              {/* Arrows showing donation direction */}
              <path d="M-80 -110 L-40 -140" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <path d="M80 -110 L40 -140" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <path d="M-80 -50 L-40 -20" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <path d="M80 -50 L40 -20" stroke="#333" strokeWidth="2" markerEnd="url(#arrowhead)" />
              
              {/* Universal donor/recipient labels */}
              <text x="-170" y="80" textAnchor="middle" fontSize="14" fill="#333">Universal Donor: O-</text>
              <text x="170" y="80" textAnchor="middle" fontSize="14" fill="#333">Universal Recipient: AB+</text>
              
              {/* Arrow marker definition */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
                </marker>
              </defs>
            </g>
          </svg>
        </div>
        
        {/* Compatibility table */}
        <div className="overflow-x-auto">
          <Table className="border border-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">Blood Type</TableHead>
                <TableHead className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">Can Donate To</TableHead>
                <TableHead className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">Can Receive From</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compatibilityData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800">{item.type}</TableCell>
                  <TableCell className="border border-gray-200 px-3 py-2 text-sm text-gray-600">{item.canDonateTo}</TableCell>
                  <TableCell className="border border-gray-200 px-3 py-2 text-sm text-gray-600">{item.canReceiveFrom}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Quick facts */}
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium">Quick Facts:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            {bloodFacts.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
