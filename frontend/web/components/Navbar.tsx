import React from 'react';
import { Search, User } from 'lucide-react';
import NotifBell from './misc/NotifBell';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-2 py-2 sm:h-16 sm:gap-3 sm:py-0">
          <div className="flex min-w-0 shrink-0 items-center gap-2 cursor-pointer">
            <span className="whitespace-nowrap text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent sm:text-xl md:text-2xl">
              ResourceX
            </span>
          </div>

          <div className="hidden min-w-0 flex-1 sm:mx-4 sm:flex lg:mx-8 lg:max-w-md">
            <div className="relative w-full min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items, categories..."
                className="w-full rounded-full border-none bg-gray-100 py-2 pl-10 pr-4 text-sm shadow-inner transition-all placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-4">
            <NotifBell count={3} />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow transition-shadow hover:shadow-md sm:h-9 sm:w-9">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
