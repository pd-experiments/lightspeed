'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export function OutlineCreator() {
  const router = useRouter();
  const [newOutlineTitle, setNewOutlineTitle] = useState<string>('');
  const [newOutlineDescription, setNewOutlineDescription] = useState<string>('');

  const handleCreateOutline = async (title: string) => {
    const newOutline = {
      title,
      created_at: new Date(),
      updated_at: new Date(),
      description: null,
    };

    try {
      const response = await fetch('/api/outlines/create-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline: newOutline }),
      });

      if (!response.ok) {
        throw new Error('Failed to create outline');
      }

      const data = await response.json();
      alert('Outline created successfully.');
      router.refresh();
    } catch (error) {
      console.error('Error creating outline:', error);
      alert('Error creating outline.');
    }
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
            <Button onClick={() => handleCreateOutline(newOutlineTitle)}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}