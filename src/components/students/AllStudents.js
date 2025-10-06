import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import logo from '../../assets/logonews.svg'

const API_BASE = "https://thenewspotent.com/manage/api";

function AllStudents() {
  const [students, setStudents] = useState([]);
  const { token } = useAuth();

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
    if (token) {
      fetchStudents();
    }
  }, [token]);

  return (
    <div className="p-8 bg-gradient-to-b from-blue-50 to-blue-100">
      <h2 className="text-3xl font-bold text-center mb-10 text-[#1f567c] drop-shadow-sm">
        🎓 Quiz Winners
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 mx-auto w-[90%]">
        {students.map((s) => (
          <div
            key={s.id}
            className="relative group bg-white rounded-2xl overflow-hidden"
          >
        

            {/* Logo */}
            <div className="flex justify-center items-center mt-4">
              <img
                src={logo}
                alt="logo"
                className="opacity-80 group-hover:opacity-100 transition-opacity w-52"
              />
            </div>

            {/* Header */}
            <h3 className="text-xs font-semibold text-[#1f567c] text-center mt-2 tracking-wider">
              Winner
            </h3>

            {/* Profile Image */}
            <div className="flex justify-center mt-4">
              <div className="relative w-28 h-28 rounded-full overflow-hidden">
                <img
                  src={`https://thenewspotent.com/manage/assets/uploads/${s.image}`}
                  alt={s.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Student Info */}
            <div className="text-center mt-4 px-4 pb-4">
            
              <h2 className="text-lg font-bold text-[#1f567c] transition-colors mb-2">
                {s.name}
              </h2>
              <div className=" h-40 overflow-scroll">
               <span>{s.description}</span>
              </div>
              <div className="bg-[#1f567c] w-[60%] mx-auto text-white rounded-full p-2 text-[16px]">
                <button>Participate Now</button>
              </div>
            </div>

       
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllStudents;
