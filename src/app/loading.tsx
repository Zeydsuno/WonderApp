export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-24 overflow-hidden">
      {/* Profile Header Skeleton */}
      <div className="w-full flex items-center justify-between px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-zinc-200 rounded-full animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="w-24 h-4 bg-zinc-200 rounded animate-pulse" />
            <div className="w-16 h-3 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-10 h-10 bg-zinc-200 rounded-full animate-pulse" />
      </div>

      <main className="px-5 pt-8">
        {/* Title Skeleton */}
        <div className="h-10 w-48 bg-zinc-200 rounded-lg mb-6 animate-pulse" />
        
        {/* Input Skeleton */}
        <div className="h-[68px] w-full bg-white rounded-2xl mb-8 shadow-xl shadow-zinc-200/50 flex items-center px-4 animate-pulse">
          <div className="w-6 h-6 bg-zinc-200 rounded-full mr-3" />
          <div className="h-5 bg-zinc-200 rounded w-1/2" />
        </div>
        
        {/* Trending Title Skeleton */}
        <div className="flex justify-between items-end mb-4">
          <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse" />
        </div>
        
        {/* Cards Skeleton */}
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[160px] h-[220px] bg-zinc-200 rounded-2xl animate-pulse shrink-0" />
          ))}
        </div>
      </main>

      {/* Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-[84px] bg-white border-t border-zinc-100 z-50 flex items-center justify-around px-2">
        {[1, 2, 3, 4].map(i => (
           <div key={i} className="w-10 h-10 bg-zinc-200 rounded-full animate-pulse" />
        ))}
      </div>
    </div>
  );
}
