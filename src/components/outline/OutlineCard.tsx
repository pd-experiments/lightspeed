import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tables } from '@/lib/types/schema';
import { Clock, Calendar, Layers, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from '@/lib/helperUtils/outline/utils';

type Outline = Tables<'outline'>;

interface OutlineCardProps {
  outline: Outline;
  elementCount: number;
  totalDuration: number;
  onDelete: () => void;
  scriptGenerated: boolean;
}

export function OutlineCard({ outline, elementCount, totalDuration, onDelete, scriptGenerated }: OutlineCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Are you sure you want to delete this outline?')) {
      try {
        const response = await fetch(`/api/outlines/delete-outline?id=${outline.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onDelete();
        } else {
          throw new Error('Failed to delete outline');
        }
      } catch (error) {
        console.error('Error deleting outline:', error);
        alert('Failed to delete outline. Please try again.');
      }
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center w-full">
          <CardTitle className="text-xl font-bold text-gray-800">{outline.title}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{outline.description}</p>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <Layers className="w-4 h-4 mr-2 text-blue-500" />
            <span>{elementCount} Elements</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Clock className="w-4 h-4 mr-2 text-green-500" />
            <span>{formatDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
            <span>Updated: {new Date(outline.updated_at).toLocaleDateString()}</span>
          </div>
          {scriptGenerated && (
            <div className="flex items-center text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span>Script Generated</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}