import { Users, CircleUserRound, Heart, LogOut, BellOff } from "lucide-react";

const Header = () => {
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white/60 backdrop-blur-sm border-b border-sage-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <a href="/" className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo/wellspring-logo-2.png" 
              alt="Wellspring Logo" 
              className="h-16 sm:h-20 md:h-24 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">Wellspring</h1>
              <p className="text-xs text-gray-600">
                Move together, grow together
              </p>
            </div>
          </a>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <a href="/community" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-900 transition hover:bg-sage-900 hover:text-white">
              <Heart size={18} className="hidden sm:inline" /> 
              <span className="hidden md:inline">Community</span>
              <span className="md:hidden">
                <Heart size={18} />
              </span>
            </a>
            <a href="/groups" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-900 transition hover:bg-sage-900 hover:text-white">
              <Users size={18} className="hidden sm:inline" /> 
              <span className="hidden md:inline">Groups</span>
              <span className="md:hidden">
                <Users size={18} />
              </span>
            </a>

            {isLoggedIn && (
              <>
                <a href="/profile" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-900 transition hover:bg-sage-900 hover:text-white">
                  <CircleUserRound size={18} className="hidden sm:inline" /> 
                  <span className="hidden md:inline">Profile</span>
                  <span className="md:hidden">
                    <CircleUserRound size={18} />
                  </span>
                </a>
                <div className="h-5 w-px bg-gray-300 mx-1 sm:mx-2 hidden sm:block" />
                <button className="text-gray-600 hover:text-sage-900 hidden sm:block">
                  <BellOff size={20} />
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-sage-900 p-1 sm:p-0">
                  <LogOut size={18} sm:size={20} />
                </button>
              </>
            )}

            {!isLoggedIn && (
              <>
                <a href="/login" className="text-xs sm:text-sm font-medium text-gray-900 hover:text-gray-600 px-2 sm:px-0">Login</a>
                <a href="/register" className="px-2 sm:px-4 py-2 bg-sage-900 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-sage-900">Register</a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;