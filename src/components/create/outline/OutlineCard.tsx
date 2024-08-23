import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tables } from '@/lib/types/schema';
import { Clock, Layers, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        const response = await fetch(`/api/create/outlines/delete-outline?id=${outline.id}`, {
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
    <Card className="hover:shadow-md transition-all duration-300 bg-white">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{outline.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{outline.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-700">
          <div className="flex items-center">
            <Layers className="w-3 h-3 mr-1 text-blue-500" />
            <span>{elementCount}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1 text-green-500" />
            <span>{formatDuration(totalDuration)}</span>
          </div>
          {scriptGenerated && (
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
              <span>Script Ready</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}