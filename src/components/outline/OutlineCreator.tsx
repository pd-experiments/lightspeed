import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OutlineCreatorProps {
  onCreateOutline: (title: string) => void;
}

export function OutlineCreator({ onCreateOutline }: OutlineCreatorProps) {
  const [newOutlineTitle, setNewOutlineTitle] = useState<string>('');

  const handleCreateOutline = () => {
    if (!newOutlineTitle.trim()) {
      alert('Please enter a title for the new outline.');
      return;
    }
    onCreateOutline(newOutlineTitle);
    setNewOutlineTitle('');
  };

  return (
    <div className="mb-6 flex items-center">
      <Input
        placeholder="Enter new outline title"
        value={newOutlineTitle}
        onChange={(e) => setNewOutlineTitle(e.target.value)}
        className="mr-2"
      />
      <Button size="sm" onClick={handleCreateOutline}>Create Outline</Button>
    </div>
  );
}