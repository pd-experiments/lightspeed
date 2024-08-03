import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Database } from '@/lib/types/schema';

interface OutlineSelectorProps {
  outlines: Outline[];
  selectedOutlineId: string | null;
  onSelectOutline: (outlineId: string) => void;
}

type Outline = Database['public']['Tables']['outline']['Row'];

export function OutlineSelector({ outlines, selectedOutlineId, onSelectOutline }: OutlineSelectorProps) {
  return (
    <Select onValueChange={(value) => onSelectOutline(value)} value={selectedOutlineId || ''}>
      <SelectTrigger className="mb-6 p-2 border">
        <SelectValue placeholder="Select an outline" />
      </SelectTrigger>
      <SelectContent>
        {outlines.map((outline) => (
          <SelectItem key={outline.id} value={outline.id}>
            {outline.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}