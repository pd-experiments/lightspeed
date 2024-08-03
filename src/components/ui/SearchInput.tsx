import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  placeholder: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onSearch, placeholder, className }) => {
  return (
    <div className={cn("flex flex-row gap-2 items-center", className)}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <Button onClick={onSearch}>Search</Button>
    </div>
  );
};

export default SearchInput;