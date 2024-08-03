import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface OutlineCreatorProps {
  onCreateOutline: (title: string, description: string) => void;
}

export function OutlineCreator({ onCreateOutline }: OutlineCreatorProps) {
  const [newOutlineTitle, setNewOutlineTitle] = useState<string>('');
  const [newOutlineDescription, setNewOutlineDescription] = useState<string>('');

  const handleCreateOutline = () => {
    if (!newOutlineTitle.trim()) {
      alert('Please enter a title for the new outline.');
      return;
    }
    onCreateOutline(newOutlineTitle, newOutlineDescription);
    setNewOutlineTitle('');
    setNewOutlineDescription('');
  };

  return (
    <div className="mb-6 flex justify-end items-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm">Create Outline</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Outline</DialogTitle>
            <DialogDescription>Assemble your new outline in just a few clicks.</DialogDescription>
          </DialogHeader>
          <div className="mb-3 flex flex-col space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                placeholder="Name of your project"
                value={newOutlineTitle}
                onChange={(e) => setNewOutlineTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <Input
                placeholder="Description of your project"
                value={newOutlineDescription}
                onChange={(e) => setNewOutlineDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewOutlineTitle(''); setNewOutlineDescription(''); }}>Cancel</Button>
            <Button onClick={handleCreateOutline}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}