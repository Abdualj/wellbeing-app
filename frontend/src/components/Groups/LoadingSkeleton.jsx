const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          {/* Image Skeleton */}
          <div className="h-48 bg-gray-200"></div>

          {/* Content Skeleton */}
          <div className="p-5">
            {/* Title */}
            <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
            
            {/* Badge */}
            <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>

            {/* Description */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>

            {/* Button */}
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
