import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Luxury Hotel</Link>
        <div className="flex items-center space-x-6">
          <Link to="/rooms" className="hover:text-blue-200">Rooms</Link>
          {user ? (
            <>
              {user.roll === 'admin' && (
                <>
                  <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                  <Link to="/manage-rooms" className="hover:text-blue-200">Manage Rooms</Link>
                  <Link to="/bookings" className="hover:text-blue-200">All Bookings</Link>
                </>
              )}
              {user.roll === 'guest' && (
                <>
                  <Link to="/my-bookings" className="hover:text-blue-200">My Bookings</Link>
                  <Link to="/book-room" className="hover:text-blue-200">Book a Room</Link>
                </>
              )}
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="hover:text-blue-200">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link
                to="/register"
                className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
