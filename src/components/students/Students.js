import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import logo from "../../assets/logonews.svg";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://thenewspotent.com/manage/api";

function Students() {
  const [students, setStudents] = useState([]);
  const { token } = useAuth();

  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setStudents(response.data.data || []);
    } catch (err) {
      console.error("Error fetching students:", err.response?.data || err);
    }
  };

  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

  return (
    <div className="w-[90%] mx-auto py-10 relative">

   <h2 className="text-[#256795] font-manrope text-[25px] text-center mb-5">
        🎓 Quiz Winners
      </h2>



      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        pagination={{
          el: ".custom-pagination",
          clickable: true,
        
        }}
        spaceBetween={30}
        breakpoints={{
          320: { slidesPerView: 1 },
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="pb-12" // adds bottom padding for pagination spacing
      >


        {/* View All Button */}
      <div className="flex justify-center mt-6" onClick={()=>navigate('/quizes')}>
         <button className="bg-[#1f567c] hover:bg-[#17445f] text-white py-2 px-6 rounded-full shadow-md transition-colors">
          View All
        </button>
      </div>

        {students.slice(0, 4).map((s) => (
          <SwiperSlide key={s.id}>
            <div className="bg-white rounded-2xl shadow-md text-center p-6 transition-all duration-300 hover:shadow-lg">
             <img src={logo} className="mx-auto object-cover mb-3" />
              <img
                className="w-20 h-20 mx-auto rounded-full object-cover mb-3"
                src={`https://thenewspotent.com/manage/assets/uploads/${s.image}`}
                alt={s.name}
              />
              <h3 className="text-lg font-semibold">{s.name}</h3>
              <p className="text-gray-500 text-sm mt-2">{s.description}</p>
              
                {/* View All Button */}
      <div className="flex justify-center mt-6" onClick={()=>navigate('/quizes')}>
        <button className="bg-[#1f567c] hover:bg-[#17445f] text-white py-2 px-6 rounded-full shadow-md transition-colors">
          Participate Now
        </button>
      </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Pagination container placed below */}
      <div className="custom-pagination flex justify-center mt-6"></div>
    </div>
  );
}

export default Students;
