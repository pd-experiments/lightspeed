import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaChildren } from "react-icons/fa6";

interface AgeGroup {
  age: string;
  count: number;
}

interface AgeTargetingProps {
  targeting: AgeGroup[];
  isLoading: boolean;
}

export default function AgeTargeting({ targeting, isLoading }: AgeTargetingProps) {
  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <FaChildren className="w-5 h-5 mr-2 text-blue-500" />
          Age Targeting
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Skeleton className="w-full h-[200px]" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={targeting}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip 
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}