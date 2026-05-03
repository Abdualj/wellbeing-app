const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <img 
          src="/wellspring-logo.png" 
          alt="Wellspring Logo" 
          className="h-64 w-auto mx-auto animate-pulse"
        />
        <div className="mt-4 flex gap-1 justify-center">
          <div className="w-2 h-2 bg-sage-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-sage-900 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-sage-900 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
