import React from 'react';
import { Home, User, Plus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Simple check for admin route to hide bottom nav
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-md relative min-h-screen bg-black shadow-2xl overflow-hidden flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 pb-24 overflow-y-auto no-scrollbar">
          {children}
        </main>

        {/* Floating Action Button (FAB) - Home only */}
        {location.pathname === '/' && (
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 hover:scale-105 transition-transform"
          >
            <Plus className="text-white w-8 h-8" />
          </button>
        )}

        {/* Bottom Nav - Only show on client pages */}
        {!isAdmin && (
            <div className="fixed bottom-0 max-w-md w-full bg-neutral-900/90 backdrop-blur-md border-t border-white/10 p-4 flex justify-around items-center z-40">
                <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-white' : 'text-neutral-500'}`}>
                    <Home size={24} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>
                <Link to="/admin" className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/admin') ? 'text-white' : 'text-neutral-500'}`}>
                    <User size={24} />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default Layout;