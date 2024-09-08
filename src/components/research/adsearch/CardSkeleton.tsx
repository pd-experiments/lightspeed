import { Skeleton } from "../../ui/skeleton";

export default function CardSkeleton({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Skeleton isLoading={isLoading} className="h-32 w-full rounded-lg" />
      <div className="flex flex-row gap-2 items-center">
        <Skeleton isLoading={isLoading} className="w-12 aspect-square rounded-full" />
        <Skeleton isLoading={isLoading} className="h-8 w-full rounded-lg" />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <Skeleton isLoading={isLoading} className="w-12 aspect-square rounded-full" />
        <Skeleton isLoading={isLoading} className="h-8 w-full rounded-lg" />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <Skeleton isLoading={isLoading} className="w-12 aspect-square rounded-full" />
        <Skeleton isLoading={isLoading} className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}
