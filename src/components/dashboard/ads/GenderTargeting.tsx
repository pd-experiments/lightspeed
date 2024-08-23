import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FaFemale } from "react-icons/fa";

interface GenderGroup {
  name: string;
  value: number;
}

interface GenderTargetingProps {
  targeting: GenderGroup[];
  isLoading: boolean;
}

//TODO: make this functional, this is basically non-functional right now as gender targeting is not properly implemented in the db

export default function GenderTargeting({ targeting, isLoading }: GenderTargetingProps) {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <FaFemale className="w-5 h-5 mr-2 text-blue-500" />
          Gender Targeting
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Skeleton className="w-full h-[200px]" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={targeting}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {targeting.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                formatter={(value, entry, index) => (
                  <span className="text-sm font-medium text-gray-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}