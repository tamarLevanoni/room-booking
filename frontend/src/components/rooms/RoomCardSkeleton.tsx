import { Card, Skeleton } from '../ui';

export const RoomCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
};
