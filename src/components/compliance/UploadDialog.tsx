import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ComplianceUploadDialogProps = {
    onUpload: (url: string) => void;
}

export function ComplianceUploadDialog({ onUpload }: ComplianceUploadDialogProps) {  
  const [url, setUrl] = useState('');

  const handleUrlUpload = async () => {
    try {
      const response = await fetch('/api/compliance/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
  
      if (response.ok) {
        console.log('URL uploaded successfully');
        onUpload(url);
      } else {
        throw new Error('Failed to upload URL');
      }
    } catch (error) {
      console.error('Error uploading URL:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Upload Compliance Document</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Compliance Document</DialogTitle>
          <DialogDescription>Enter the URL of the compliance document you want to upload.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/compliance-doc"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setUrl('')}>Cancel</Button>
          <Button onClick={handleUrlUpload}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}