import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE = "https://thenewspotent.com/manage/api";

function Students() {
  const [students, setStudents] = useState([]);
  const { token } = useAuth();

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // GET doesn’t need form-urlencoded
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
 <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {students.map((s) => (
    <div
      key={s.id}
      className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center text-center border border-gray-200"
    >
      {/* University Logo */}
      <img
        src="/university-logo.png" // replace with your logo
        alt="logo"
        className="h-10 mb-3"
      />

      <h3 className="text-sm font-semibold text-gray-500 mb-2">
        TEMPORARY STUDENT ID CARD
      </h3>

      {/* Profile Image */}
      <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-gray-200">
        <img
          src={`https://thenewspotent.com/manage/assets/uploads/${s.image}`}
          alt={s.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Student Name */}
      <h2 className="text-lg font-bold text-gray-800">{s.name}</h2>
      <p className="text-xs text-gray-500 mb-4">NAME</p>

      {/* Course */}
      <div className="w-full text-left mt-2 border-t border-gray-300 pt-2">
        <p className="text-sm font-semibold text-gray-700">
          COURSE <span className="float-right font-normal">{s.course}</span>
        </p>
      </div>

      {/* Student ID */}
      <div className="w-full text-left mt-2 border-t border-gray-300 pt-2">
        <p className="text-sm font-semibold text-gray-700">
          STUDENT ID <span className="float-right font-normal">{s.student_id}</span>
        </p>
      </div>
    </div>
  ))}
</div>

  );
}

export default Students;
