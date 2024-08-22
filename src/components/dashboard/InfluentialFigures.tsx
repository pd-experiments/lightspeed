import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Influential Figures & Entities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : Array.isArray(figures) && figures.length > 0 ? (
          <ul className="space-y-3">
            {figures.map((figure, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg transition-all hover:bg-gray-200">
                <div className="flex items-center">
                  <Avatar className={`h-10 w-10 ${getColorClass(index)}`}>
                    <AvatarFallback>{getInitials(figure.name)}</AvatarFallback>
                  </Avatar>
                  <span className="ml-3 font-medium">{figure.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Mentions:</span>
                  <span className="font-semibold">{figure.mentionCount}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No influential figures found.</p>
        )}
      </CardContent>
    </Card>
  );
}