import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Index = () => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axiosInstance.get('/api/rooms');
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-cover bg-center" style={{ backgroundImage: "url('/qut-hero.png')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to QUT Hotel</h1>
            <p className="text-xl mb-8">Experience Unparalleled Comfort and Elegance</p>
            <button 
              onClick={() => navigate('/rooms')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition duration-300"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <i className="fas fa-wifi text-4xl text-blue-600 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Free High-Speed WiFi</h3>
            <p className="text-gray-600">Stay connected throughout your stay</p>
          </div>
          <div className="text-center">
            <i className="fas fa-utensils text-4xl text-blue-600 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Fine Dining</h3>
            <p className="text-gray-600">24/7 restaurant and room service</p>
          </div>
          <div className="text-center">
            <i className="fas fa-spa text-4xl text-blue-600 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Luxury Spa</h3>
            <p className="text-gray-600">Relax and rejuvenate</p>
          </div>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div key={room._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img 
                  src={room.images[0]} 
                  alt={room.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-4">{room.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">${room.price}/night</span>
                    <button 
                      onClick={() => navigate(`/rooms/${room._id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
          <p className="text-xl mb-4">For reservations and inquiries:</p>
          <p className="text-2xl font-semibold text-blue-600">+1 (555) 123-4567</p>
          <p className="text-lg text-gray-600 mt-2">info@luxuryhotel.com</p>
          <p className="text-lg text-gray-600">123 Luxury Avenue, Brisbane, QLD 4000</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
