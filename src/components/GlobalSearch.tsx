import React from 'react';
import SearchInput from '@/components/ui/SearchInput';
import { OutlineSelector } from '@/components/create/outline/OutlineSelector';
import ClipCard from '@/components/create/clipsearch/ClipCard';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ClipSearchResult } from '@/lib/types/customTypes';
import { Database } from '@/lib/types/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginatedDataTable } from './ui/paginated-data-table';
import { Row } from '@tanstack/react-table';

type Outline = Database['public']['Tables']['outline']['Row'];

interface GlobalSearchTabProps {
  searchQuery: string;
  handleGlobalSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearching: boolean;
  outlines: Outline[];
  selectedOutlineId: string | null;
  setSelectedOutlineId: (id: string) => void;
  searchResults: ClipSearchResult[];
  addToOutline: (item: ClipSearchResult) => void;
  showMore: number | null;
  setShowMore: (index: number | null) => void;
  playerRef: React.RefObject<any>;
  isLoading: boolean;
}

export function GlobalSearchTab({
  searchQuery,
  handleGlobalSearch,
  isSearching,
  outlines,
  selectedOutlineId,
  setSelectedOutlineId,
  searchResults,
  addToOutline,
  showMore,
  setShowMore,
  playerRef,
  isLoading,
}: GlobalSearchTabProps) {
  const formatText = (text: string) => {
    return text
      .split(". ")
      .map((sentence) => {
        const trimmedSentence = sentence.trim();
        return (
          trimmedSentence.charAt(0).toUpperCase() +
          trimmedSentence.slice(1).toLowerCase()
        );
      })
      .join(". ");
  };

  return (
    <div className="mb-4 mt-10">
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <SearchInput
              value={searchQuery}
              onChange={handleGlobalSearch}
              onSearch={() => {}}
              placeholder="Search across all videos..."
              className="w-full"
            />
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-40" />
        ) : (
          <OutlineSelector
            outlines={outlines}
            selectedOutlineId={selectedOutlineId}
            onSelectOutline={setSelectedOutlineId}
            size="small"
          />
        )}
        {isLoading ? (
          <Skeleton className="h-10 w-32" />
        ) : (
          <Button
            onClick={() =>
              searchResults.map((item) => addToOutline(item))
            }
          >
            Add to Outline
          </Button>
        )}
      </div>
      {isSearching && (
        <p className="text-sm text-gray-500 mt-2">Searching...</p>
      )}
    </div>
    <div className="rounded-md overflow-hidden">
      <Tabs defaultValue="cards">
        <TabsList className="rounded-md">
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        <TabsContent value="cards">
          {isLoading ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))}
            </div>
          ) : !searchResults || searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results found.
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((item, index) => (
                isSearching ? (
                  <Skeleton key={index} className="h-64 w-full" />
                ) : (
                  <ClipCard
                    key={index}
                    item={item}
                    showMore={showMore === index}
                    onShowMore={() => setShowMore(showMore === index ? null : index)}
                    onAddToOutline={() => addToOutline(item)}
                    disabled={!selectedOutlineId}
                  />
                )
              ))}
            </div>
          )}
        </TabsContent>
          <TabsContent value="table">
            <PaginatedDataTable
              isLoading={isLoading}
              itemsPerPage={20}
              columns={[
                {
                  accessorKey: "timestamp",
                  header: "Timestamp",
                  cell: ({ row }: { row: Row<ClipSearchResult> }) => (
                    <div
                      className="text-sm font-medium text-gray-600 cursor-pointer"
                      onClick={() => {
                        if (playerRef.current) {
                          playerRef.current.seekTo(
                            new Date(row.original.start_timestamp).getTime() / 1000,
                            "seconds"
                          );
                        }
                      }}
                    >
                      {new Date(row.original.start_timestamp).toISOString().slice(11, 19)} -{' '}
                      {new Date(row.original.end_timestamp).toISOString().slice(11, 19)}
                    </div>
                  ),
                },
                {
                  accessorKey: "video_id",
                  header: "Video ID",
                  cell: ({ row }: { row: Row<ClipSearchResult> }) => (
                    <div className="text-gray-800 text-sm text-left">
                      {row.original.video_id}
                    </div>
                  ),
                },
                {
                  accessorKey: "title",
                  header: "Title",
                  cell: ({ row }: { row: Row<ClipSearchResult> }) => (
                    <div className="text-gray-800 text-sm text-left">
                      {row.original.title}
                    </div>
                  ),
                },
                {
                  accessorKey: "text",
                  header: "Soundbite",
                  cell: ({ row }: { row: Row<ClipSearchResult> }) => (
                    <div className=" text-gray-800 max-w-[700px] text-sm text-left">
                      {formatText(row.original.text)}
                    </div>
                  ),
                },
                {
                  accessorKey: "outlineAdd",
                  header: "Add to Outline",
                  cell: ({ row }: { row: Row<ClipSearchResult> }) => (
                    <Button className="w-full" onClick={() => addToOutline(row.original)} disabled={!selectedOutlineId}>
                      Add to Outline
                    </Button>
                  ),
                },
              ]}
              data={searchResults}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GlobalSearchTab;