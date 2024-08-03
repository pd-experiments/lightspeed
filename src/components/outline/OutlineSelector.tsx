import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Database } from '@/lib/types/schema';

interface OutlineSelectorProps {
    outlines: Outline[];
    selectedOutlineId: string | null;
    onSelectOutline: (outlineId: string) => void;
    size?: 'default' | 'small';
  }
  
  type Outline = Database['public']['Tables']['outline']['Row'];
  
export function OutlineSelector({ outlines, selectedOutlineId, onSelectOutline, size = 'default' }: OutlineSelectorProps) {
  return (
    <Select onValueChange={(value) => onSelectOutline(value)} value={selectedOutlineId || ''}>
      <SelectTrigger className={`p-2 border ${size === 'small' ? 'w-40' : 'w-full'}`}>
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