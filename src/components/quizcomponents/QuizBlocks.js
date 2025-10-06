import React from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import AuthModal from "../../Authmodal/AuthModal";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


function QuizBlocks() {

      const { user,token } = useAuth();
      const [authOpen, setAuthOpen] = useState(false);
      const [pendingQuiz, setPendingQuiz] = useState(null);

      const navigate = useNavigate();

const API_BASE = 'https://thenewspotent.com/manage/api';



useEffect(() => {
  if (user && pendingQuiz) {
    handleSubscribe(pendingQuiz);  // continue where user left off
    setPendingQuiz(null);          // clear it after using
  }
}, [user]);






    
  const planIds = {
    "Weekly Quizzes": "plan_RPMK3725W6iQZ",
    "Yearbook": "plan_RPML5nSoivIawX",
    "Monthly Book": "plan_RPMLmIqG2eurSd",
    "Quarterly Book": "plan_RPMMNgjidCYTSL",
    "Semi Annual Book": "plan_RPMNdCmYY0o4B1",
  };

  const quizzes = [
    {
      title: "Weekly Quizzes",
      price: 199,
      description:
        "Challenge yourself every week with fresh, fun, and fast-paced quizzes to sharpen your knowledge.",
    },
    {
      title: "Yearbook",
      price: 99,
      description:
        "A grand year-end quiz collection covering all highlights and major topics from the year.",
    },
    {
      title: "Monthly Book",
      price: 99,
      description:
        "Test your knowledge with curated monthly quizzes featuring trending and general knowledge topics.",
    },
    {
      title: "Quarterly Book",
      price: 99,
      description:
        "Revisit each quarter’s key moments and topics through engaging, knowledge-packed quizzes.",
    },
    {
      title: "Semi Annual Book",
      price: 99,
      description:
        "Half-yearly quiz edition designed to test your consistency and memory over 6 months of events.",
    },
  ];




const handleSubscribe = async (quizTitle) => {
  try {
    if (!user) {
      setPendingQuiz(quizTitle); // store quiz name
      setAuthOpen(true); // open login modal
      return;
    }
    setAuthOpen(false);
    // ✅ Proceed to create subscription when logged in
    const { data } = await axios.post(`${API_BASE}/create-subscription`, {
      plan_id: planIds[quizTitle],
      userId: user.id,
    },{
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
    });

    const options = {
      key: data.key,
      subscription_id: data.subscriptionId,
      name: "QuizPro Platform",
      description: `${quizTitle} - 1 Year Subscription`,
      theme: { color: "#1f567c" },
      handler: function (response) {
        console.log("Payment success:", response);
        alert(`✅ Subscription activated for ${quizTitle}!`);
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.number,
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

    rzp.on("payment.failed", function (response) {
      alert("❌ Payment failed. Please try again.");
      console.error(response.error);
    });
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again later.");
  }
};






  return (
    <div className="bg-gray-50 py-12 px-6 my-4 rounded-[12px]">
              <AuthModal  open={authOpen}  onClose={() => setAuthOpen(false)} />
      <h2 className="text-3xl font-bold text-center mb-10 text-[#1f567c]">
        Explore Our Quiz Challenges
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {quizzes.map((quiz, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#1f567c] mb-2">
                  {quiz.title}
                </h3>
                <p className="text-gray-600 mb-4 min-h-[80px]">
                  {quiz.description}
                </p>
              </div>
              <p className="text-lg font-bold text-[#1f567c] mt-auto">
                ₹{quiz.price}/year
              </p>
            </div>

            <button
              onClick={() => handleSubscribe(quiz.title)}
              className="mt-6 bg-[#1f567c] text-white py-2 rounded-lg font-medium hover:bg-[#143751] transition-colors"
            >
              Participate Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizBlocks;
