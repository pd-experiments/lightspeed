import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface Figure {
  name: string;
  mentionCount: number;
}

interface InfluentialFiguresProps {
  figures: Figure[];
  isLoading: boolean;
}

export default function InfluentialFigures({ figures, isLoading }: InfluentialFiguresProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getColorClass = (index: number) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden h-full">
      <CardHeader className="border-b bg-gray-50 p-4">
        <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
          <Users className="w-5 h-5 mr-2 text-indigo-500" />
          Influential Figures & Entities
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : Array.isArray(figures) && figures.length > 0 ? (
          <ul className="space-y-2">
            {figures.map((figure, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md transition-all hover:bg-gray-100">
                <div className="flex items-center">
                  <Avatar className={`h-8 w-8 ${getColorClass(index)}`}>
                    <AvatarFallback className="text-xs text-gray-500">{getInitials(figure.name)}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium">{figure.name}</span>
                </div>
                <span className="text-xs text-gray-500">{figure.mentionCount} mentions</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 text-sm">No influential figures found.</p>
        )}
      </CardContent>
    </Card>
  );
}