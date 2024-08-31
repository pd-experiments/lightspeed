import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tag } from 'lucide-react';

interface KeywordAnalysisProps {
  keywords: { keyword: string; count: number }[];
  isLoading: boolean;
}

export default function KeywordAnalysis({ keywords, isLoading }: KeywordAnalysisProps) {
  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <Tag className="w-5 h-5 mr-2 text-blue-500" />
          Top Keywords
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keywords} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" />
              <YAxis dataKey="keyword" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}