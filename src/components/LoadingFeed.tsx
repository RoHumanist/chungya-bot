export default function LoadingFeed() {
  return (
    <div className="space-y-0">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 border-b border-toss-gray-100 animate-pulse">
          <div className="flex gap-2 mb-3">
            <div className="w-12 h-5 bg-toss-gray-100 rounded-full" />
            <div className="w-10 h-5 bg-toss-gray-100 rounded-full" />
          </div>
          <div className="w-48 h-6 bg-toss-gray-100 rounded mb-2" />
          <div className="w-24 h-4 bg-toss-gray-100 rounded mb-4" />
          <div className="flex gap-6">
            <div className="w-20 h-10 bg-toss-gray-100 rounded" />
            <div className="w-20 h-10 bg-toss-gray-100 rounded" />
            <div className="w-16 h-10 bg-toss-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
