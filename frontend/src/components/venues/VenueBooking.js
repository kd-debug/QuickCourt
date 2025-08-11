import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const VenueBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const [facility, setFacility] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSport, setSelectedSport] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [duration, setDuration] = useState(1);
    const [selectedCourts, setSelectedCourts] = useState([]);
    const [availableCourts, setAvailableCourts] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [isTimeAvailable, setIsTimeAvailable] = useState(true);
    const [price, setPrice] = useState(0);
    
    const calendarRef = useRef(null);
    const timeSlotsRef = useRef(null);
    const [calendarMonth, setCalendarMonth] = useState(null);
    const [calendarYear, setCalendarYear] = useState(null);

    // Get facility data and sport from location state
    useEffect(() => {
        const loadFacility = async () => {
            try {
                const res = await axios.get(`/api/facilities/${id}`);
                setFacility(res.data.facility);
                
                // Set sport from location state or default to facility category
                if (location.state?.sport) {
                    setSelectedSport(location.state.sport);
                } else if (res.data.facility?.category) {
                    setSelectedSport(res.data.facility.category);
                }
                
                // Set default date to today
                const today = new Date();
                const formattedDate = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
                setSelectedDate(formattedDate);
                
                // Initialize calendar month and year
                setCalendarMonth(today.getMonth());
                setCalendarYear(today.getFullYear());
                
                // Set default time to current time + 1 hour
                const currentHour = today.getHours();
                const nextHour = currentHour + 1;
                const timeString = `${nextHour.toString().padStart(2, '0')}:00 ${nextHour >= 12 ? 'PM' : 'AM'}`;
                setSelectedTime(timeString);
                
            } catch (error) {
                toast.error('Failed to load venue details');
                navigate('/dashboard/venues');
            } finally {
                setLoading(false);
            }
        };
        
        loadFacility();
    }, [id, navigate, location.state]);

    // Calculate price when duration changes
    useEffect(() => {
        if (facility && duration) {
            setPrice(facility.pricePerHour * duration);
        }
    }, [facility, duration]);

    // Check time availability when date, time, or duration changes
    useEffect(() => {
        if (selectedDate && selectedTime && duration && facility) {
            checkTimeAvailability();
        }
    }, [selectedDate, selectedTime, duration, facility]);

    // Generate time slots based on facility open hours
    const generateTimeSlots = () => {
        if (!facility?.openHours) return [];
        
        const slots = [];
        const openTime = facility.openHours.open;
        const closeTime = facility.openHours.close;
        
        // Convert to 24-hour format for easier manipulation
        const openHour = convertTo24Hour(openTime);
        const closeHour = convertTo24Hour(closeTime);
        
        for (let hour = openHour; hour < closeHour; hour++) {
            const timeString = convertTo12Hour(hour);
            slots.push(timeString);
        }
        
        return slots;
    };

    // Convert 12-hour format to 24-hour
    const convertTo24Hour = (time12h) => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        
        hours = parseInt(hours);
        if (modifier === 'PM' && hours !== 12) {
            hours += 12;
        }
        if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return hours;
    };

    // Convert 24-hour format to 12-hour
    const convertTo12Hour = (hour24) => {
        const hour = hour24 % 12;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour === 0 ? 12 : hour}:00 ${ampm}`;
    };

    // Check if selected time is available
    const checkTimeAvailability = async () => {
        if (!selectedDate || !selectedTime || !duration || !facility) return;
        
        try {
            // Convert 12-hour time to 24-hour for proper date creation
            const [time, modifier] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            
            if (modifier === 'PM' && hours !== 12) {
                hours += 12;
            }
            if (modifier === 'AM' && hours === 12) {
                hours = 0;
            }
            
            const startTime = new Date(`${selectedDate}T${hours.toString().padStart(2, '0')}:00:00`);
            const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
            
            // Check if time is within facility hours
            const openHour = convertTo24Hour(facility.openHours.open);
            const closeHour = convertTo24Hour(facility.openHours.close);
            
            if (hours < openHour || hours + duration > closeHour) {
                setIsTimeAvailable(false);
                setAvailableCourts([]);
                return;
            }
            
            // Check for existing bookings in checkTimeAvailability function
            const res = await axios.get(`/api/bookings/availability`, {
                params: {
                    facilityId: facility._id,
                    date: selectedDate,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString()
                }
            });
            
            setIsTimeAvailable(res.data.available);
            if (res.data.available) {
                setAvailableCourts(res.data.availableCourts || []);
            } else {
                setAvailableCourts([]);
            }
            
        } catch (error) {
            console.error('Error checking availability:', error);
            setIsTimeAvailable(false);
            setAvailableCourts([]);
        }
    };

    // Handle court selection
    const handleCourtSelection = (court) => {
        if (selectedCourts.includes(court)) {
            setSelectedCourts(selectedCourts.filter(c => c !== court));
        } else {
            setSelectedCourts([...selectedCourts, court]);
        }
    };

    // When opening calendar, set month/year to selectedDate
    const handleCalendarOpen = () => {
        if (selectedDate) {
            const dateObj = new Date(selectedDate + 'T00:00:00'); // Add time to avoid timezone issues
            setCalendarMonth(dateObj.getMonth());
            setCalendarYear(dateObj.getFullYear());
        } else {
            const today = new Date();
            setCalendarMonth(today.getMonth());
            setCalendarYear(today.getFullYear());
        }
        setShowCalendar(true);
    };

    // Close calendar and time slots when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCalendar && !event.target.closest('.calendar-container')) {
                setShowCalendar(false);
            }
            if (showTimeSlots && !event.target.closest('.time-slots-container')) {
                setShowTimeSlots(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar, showTimeSlots]);

    // Handle booking submission
    const handleBooking = async () => {
        if (!selectedDate || !selectedTime || !duration || selectedCourts.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        if (!isTimeAvailable) {
            toast.error('Selected time is not available. Please choose a different time.');
            return;
        }
        
        try {
            // Convert 12-hour time to 24-hour for proper date creation
            const [time, modifier] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours);
            
            if (modifier === 'PM' && hours !== 12) {
                hours += 12;
            }
            if (modifier === 'AM' && hours === 12) {
                hours = 0;
            }
            
            // Create date using local time to avoid timezone issues in handleBooking
            const startTime = new Date(`${selectedDate}T${hours.toString().padStart(2, '0')}:00:00`);
            const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
            
            const bookingData = {
                facility: facility._id,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                amount: price,
                selectedCourts: selectedCourts,
                sport: selectedSport
            };
            
            const res = await axios.post('/api/bookings', bookingData);
            
            if (res.data.success) {
                toast.success('Transaction Done!');
                setTimeout(() => {
                    navigate('/dashboard/my-bookings');
                }, 1500);
            }
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        }
    };

    // Generate calendar dates for the current calendarMonth/calendarYear
    const generateCalendarDates = () => {
        const dates = [];
        const today = new Date();
        const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const startDay = firstDayOfMonth.getDay();
        
        // Fill empty slots before the 1st
        for (let i = 0; i < startDay; i++) {
            dates.push(null);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(calendarYear, calendarMonth, day);
            // Use local date string to avoid timezone issues
            const localDateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            dates.push({
                day,
                date: localDateString,
                isToday: localDateString === today.toLocaleDateString('en-CA'),
                isSelected: localDateString === selectedDate
            });
        }
        return dates;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-xl">Loading venue details...</div>
            </div>
        );
    }

    if (!facility) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-xl">Venue not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Venue Booking Page</h1>
                    <p className="text-gray-600 mt-2">Book your preferred time slot for {facility.name}</p>
                </div>

                {/* Main Booking Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Court Booking</h2>
                    
                    {/* Venue Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-lg">{facility.name}</h3>
                        <p className="text-gray-600">{facility.address?.line1}, {facility.address?.city}</p>
                        <div className="flex items-center mt-2">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span className="font-medium">{facility.rating || 0} ({facility.ratingCount || 0})</span>
                        </div>
                    </div>

                    {/* Sport Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
                        <div className="relative">
                            <select
                                value={selectedSport}
                                onChange={(e) => setSelectedSport(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Select Sport</option>
                                <option value="badminton">Badminton</option>
                                <option value="tennis">Tennis</option>
                                <option value="table tennis">Table Tennis</option>
                                <option value="cricket">Cricket</option>
                                <option value="football">Football</option>
                                <option value="basketball">Basketball</option>
                                <option value="swimming pool">Swimming Pool</option>
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {/* Sport icon placeholder */}
                                <span className="text-gray-400">🏸</span>
                            </div>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={selectedDate}
                                onClick={handleCalendarOpen}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                                placeholder="Select Date"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <span className="text-gray-400">📅</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">The selected date must be today or later</p>
                        
                        {/* Calendar Popup */}
                        {showCalendar && (
                            <div className="calendar-container absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">
                        {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="flex space-x-2">
                        <button 
                            className="p-1 hover:bg-gray-100 rounded" 
                            onClick={() => {
                                if (calendarMonth === 0) {
                                    setCalendarMonth(11);
                                    setCalendarYear(calendarYear - 1);
                                } else {
                                    setCalendarMonth(calendarMonth - 1);
                                }
                            }}
                        >
                            ‹
                        </button>
                        <button 
                            className="p-1 hover:bg-gray-100 rounded" 
                            onClick={() => {
                                if (calendarMonth === 11) {
                                    setCalendarMonth(0);
                                    setCalendarYear(calendarYear + 1);
                                } else {
                                    setCalendarMonth(calendarMonth + 1);
                                }
                            }}
                        >
                            ›
                        </button>
                    </div>
                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-xs text-gray-500 p-2">{day}</div>
                                    ))}
                                    {generateCalendarDates().map((item, idx) => item ? (
                                        <button
                                            key={item.day + item.date}
                                            onClick={() => {
                                                setSelectedDate(item.date);
                                                setShowCalendar(false);
                                            }}
                                            className={`p-2 text-sm rounded hover:bg-gray-100 ${
                                                item.isSelected ? 'bg-green-500 text-white' : 
                                                item.isToday ? 'bg-blue-100' : ''
                                            }`}
                                        >
                                            {item.day}
                                        </button>
                                    ) : <div key={idx}></div>)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Start Time Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={selectedTime}
                                onClick={() => setShowTimeSlots(!showTimeSlots)}
                                readOnly
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer ${
                                    isTimeAvailable ? 'border-gray-300' : 'border-red-300'
                                }`}
                                placeholder="Select Time"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <span className="text-gray-400">🕐</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Start time must be in the future</p>
                        {!isTimeAvailable && (
                            <p className="text-xs text-red-500 mt-1">Unavailable time slots are disabled and cannot be selected</p>
                        )}
                        
                        {/* Time Slots Popup */}
                        {showTimeSlots && (
                            <div className="time-slots-container absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-60 overflow-y-auto">
                                {generateTimeSlots().map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => {
                                            setSelectedTime(time);
                                            setShowTimeSlots(false);
                                        }}
                                        className={`w-full text-left p-2 rounded hover:bg-gray-100 ${
                                            time === selectedTime ? 'bg-green-500 text-white' : ''
                                        }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Duration Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setDuration(Math.max(1, duration - 1))}
                                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                            >
                                -
                            </button>
                            <span className="text-lg font-medium">{duration} Hr</span>
                            <button
                                onClick={() => setDuration(duration + 1)}
                                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Court Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Court</label>
                        {availableCourts.length > 0 ? (
                            <div className="space-y-2">
                                {availableCourts.map((court) => (
                                    <label key={court} className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedCourts.includes(court)}
                                            onChange={() => handleCourtSelection(court)}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-gray-700">{court}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No courts available for selected time</p>
                        )}
                        
                        {/* Selected Courts */}
                        {selectedCourts.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {selectedCourts.map((court, index) => (
                                    <div key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                                        {court} X
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Button */}
                    <div className="mt-8">
                        <button
                            onClick={handleBooking}
                            disabled={!isTimeAvailable || selectedCourts.length === 0}
                            className={`w-full py-4 rounded-lg font-semibold text-lg ${
                                isTimeAvailable && selectedCourts.length > 0
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Continue to Payment - ₹{price.toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueBooking;
