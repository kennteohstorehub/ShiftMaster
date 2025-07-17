import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-card">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

export function SkeletonSchedule() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 bg-muted/50">
          <Skeleton className="h-12 m-2" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 m-2" />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, roleIndex) => (
            <div key={roleIndex} className="grid grid-cols-8 p-3">
              <Skeleton className="h-6 w-20" />
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div key={dayIndex} className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}