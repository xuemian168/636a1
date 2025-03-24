import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Booking state
  const [bookingDates, setBookingDates] = useState({
    checkIn: '',
    checkOut: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axiosInstance.get('/api/hotel/rooms');
      setRooms(response.data);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to fetch rooms');
      setIsLoading(false);
    }
  };

  const handleBooking = async (roomId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingDates.checkIn || !bookingDates.checkOut) {
      setError('请选择入住和退房日期');
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/hotel/rooms/${roomId}/book`, {
        roomId,
        checkIn: bookingDates.checkIn,
        checkOut: bookingDates.checkOut
      });

      if (response.data.success) {
        alert(`预订成功！
          订单号: ${response.data.data.orderId}
          房间: ${response.data.data.roomName}
          入住日期: ${response.data.data.checkIn}
          退房日期: ${response.data.data.checkOut}
          总价: $${response.data.data.totalPrice}
        `);
        
        // 重置预订表单
        setBookingDates({
          checkIn: '',
          checkOut: ''
        });
        
        // 刷新房间列表
        fetchRooms();
      }
    } catch (error) {
      setError(error.response?.data?.message || '预订失败，请稍后重试');
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Available Hotel Rooms</h1>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src={room.images[0] || '/default-room.jpg'} 
                alt={room.name} 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{room.name}</h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {room.roomType}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{room.description}</p>
                <div className="space-y-2 mb-4">
                  <p><span className="font-semibold">Price:</span> ${room.price}/night</p>
                  <p><span className="font-semibold">Max People:</span> {room.maxPeople}</p>
                  <p><span className="font-semibold">Size:</span> {room.size}m²</p>
                  <p><span className="font-semibold">Floor:</span> {room.floor}</p>
                </div>

                {/* Booking Form */}
                {room.status === 'Available' && (
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={bookingDates.checkIn}
                      onChange={(e) => setBookingDates({...bookingDates, checkIn: e.target.value})}
                      className="w-full p-2 border rounded"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <input
                      type="date"
                      value={bookingDates.checkOut}
                      onChange={(e) => setBookingDates({...bookingDates, checkOut: e.target.value})}
                      className="w-full p-2 border rounded"
                      min={bookingDates.checkIn || new Date().toISOString().split('T')[0]}
                    />
                    <button
                      onClick={() => handleBooking(room._id)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      disabled={!bookingDates.checkIn || !bookingDates.checkOut}
                    >
                      Book Now
                    </button>
                  </div>
                )}

                {/* Amenities */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Amenities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rooms;