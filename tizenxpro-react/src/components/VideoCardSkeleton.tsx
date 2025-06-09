import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoCardSkeleton() {
  return (
    <Card className="w-full h-64">
      <Skeleton className="w-full h-36 rounded-t-xl" />
      <CardContent className="px-3 py-2">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}