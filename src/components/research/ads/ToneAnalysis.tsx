import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MessageCircle } from 'lucide-react';

interface ToneAnalysisProps {
  tones: { tone: string; count: number }[];
  isLoading: boolean;
}

export default function ToneAnalysis({ tones, isLoading }: ToneAnalysisProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
          Ad Tones
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tones}
                dataKey="count"
                nameKey="tone"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {tones.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}