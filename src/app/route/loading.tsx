export default function RouteLoading() {
  return (
    <div className="relative w-full h-screen bg-zinc-200 overflow-hidden">
      {/* Map Skeleton Background */}
      <div className="absolute inset-0 bg-zinc-300 animate-pulse" />
      
      {/* Top Floating Buttons Skeleton */}
      <div className="absolute top-14 left-5 w-12 h-12 bg-white rounded-full shadow-lg animate-pulse z-10" />
      <div className="absolute top-14 right-5 w-12 h-12 bg-white rounded-full shadow-lg animate-pulse z-10" />

      {/* Bottom Sheet Skeleton */}
      <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-5 z-10 flex flex-col">
        {/* Handle */}
        <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6 animate-pulse" />
        
        {/* Date / Title */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-40 bg-zinc-200 rounded animate-pulse" />
          <div className="h-8 w-24 bg-zinc-200 rounded-full animate-pulse" />
        </div>
        
        {/* Timeline Items */}
        <div className="flex-1 flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 w-full">
              <div className="w-12 h-12 bg-zinc-200 rounded-xl shrink-0 animate-pulse" />
              <div className="flex-1 py-1">
                <div className="h-5 w-3/4 bg-zinc-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/2 bg-zinc-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-[84px] bg-white border-t border-zinc-100 z-50 flex items-center justify-around px-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-10 h-10 bg-zinc-200 rounded-full animate-pulse" />
        ))}
      </div>
    </div>
  );
}
