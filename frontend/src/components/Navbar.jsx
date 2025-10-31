import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className="sticky top-0 z-50 shadow-lg border-b"
      style={{ background: "linear-gradient(90deg,#7C4A2E,#5B3426)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 relative">
        <div className="w-full flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-3">
            <div className="w-12" />
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
            <Link
              to="/"
              className="pointer-events-auto no-underline"
            >
              <span
                className="font-serif font-extrabold tracking-tight select-none"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.98), rgba(255,255,255,0.85))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                Expense Tracker
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm italic text-white/80 mr-2">
                  Hi, {user?.name?.split(" ")[0] || "User"}
                </span>

                <button
                  onClick={handleLogout}
                  className="bg-[#D9534F] text-white px-3 py-1.5 rounded-md font-medium hover:bg-[#c3423e] transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-white/90 text-[#5b3426] px-4 py-2 rounded-md font-medium shadow-sm hover:brightness-95 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white/90 text-[#5b3426] px-4 py-2 rounded-md font-medium shadow-sm hover:brightness-95 transition"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-md focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
            </button>
          </div>
        </div>

        <div className="w-full border-t border-white/10 my-3" />

        <div className="hidden md:flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="bg-white/95 text-[#5b3426] px-4 py-2 rounded-full font-medium shadow-sm hover:brightness-95 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/add"
            className="bg-white/95 text-[#5b3426] px-4 py-2 rounded-full font-medium shadow-sm hover:brightness-95 transition"
          >
            Add Expense
          </Link>
          <Link
            to="/reports"
            className="bg-white/95 text-[#5b3426] px-4 py-2 rounded-full font-medium shadow-sm hover:brightness-95 transition"
          >
            Reports
          </Link>
        </div>

        {menuOpen && (
          <div
            className="md:hidden w-full mt-4 rounded-b-md p-4"
            style={{ background: "linear-gradient(180deg,#7C4A2E,#5B3426)" }}
          >
            <div className="flex flex-col items-center space-y-3">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center bg-white/95 text-[#5b3426] px-4 py-2 rounded-md font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/add"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center bg-white/95 text-[#5b3426] px-4 py-2 rounded-md font-medium"
                  >
                    Add Expense
                  </Link>
                  <Link
                    to="/reports"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center bg-white/95 text-[#5b3426] px-4 py-2 rounded-md font-medium"
                  >
                    Reports
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center bg-white/95 text-[#5b3426] px-4 py-2 rounded-md font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-center bg-white/95 text-[#5b3426] px-4 py-2 rounded-md font-medium"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
