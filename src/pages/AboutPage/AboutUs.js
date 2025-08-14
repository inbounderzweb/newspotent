import React from 'react'
import contactimg   from '../../assets/newscontact.svg';
import aboutsec     from '../../assets/aboutsec.svg';
import aboutmission from '../../assets/abtmission.svg';
import aboutvalue   from '../../assets/abtvalue.svg';
import aboutvision  from '../../assets/abtvision.svg';

function AboutUs() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire up submission
  };

  return (
    <div>
      <div>
        {/* Hero section */}
        <div
          className="h-[242px] flex mx-auto bg-center bg-cover justify-center bg-no-repeat bg-[#BDD3E3]"
        >
          <div className="flex items-center gap-2 lg:gap-10">
            <img src={contactimg} alt="contact-img" />
            <span className="text-[#0E283A] text-[28px] font-manrope text-center">
              About us
            </span>
          </div>
        </div>
        {/* End Hero */}
      </div>

      {/* About copy + image */}
      <div className="w-[95%] lg:w-[60%] flex items-center justify-center mx-auto py-10 lg:py-24">
        <div className="grid lg:flex items-center gap-5 lg:gap-10">
          <img src={aboutsec} alt="about-section-image" />
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
            ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
            consequat. Duis autem vel eum.Lorem ipsum dolor sit amet,
            consectetuer adipiscing elit, sed diam nonummy nibh euismod
            tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi
            enim ad minim veniam, quis nostrud exerci tation ullamcorper
            suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis
            autem vel eum.
          </p>
        </div>
      </div>

      {/* Mission / Vision / Values */}
      <div className="">
        <div className="grid lg:flex items-center w-[95%] lg:w-[75%] gap-5 lg:gap-10 mx-auto pb-5 lg:pb-24">
          <div>
            <img src={aboutmission} alt="about-mission" className="my-4" />
            <span className="pb-4 text-[#2972A5] text-[24px] font-[500]">Mission</span>
            <p className="text-[16px] font-manrope leading-[170%]">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam
              erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci
              tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
              consequat.
            </p>
          </div>

          <div>
            <img src={aboutvision} alt="about-vision" className="my-4" />
            <span className="pb-4 text-[#2972A5] text-[24px] font-[500]">Mission</span>
            <p className="text-[16px] font-manrope leading-[170%]">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam
              erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci
              tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
              consequat.
            </p>
          </div>

          <div>
            <img src={aboutvalue} alt="about-values" className="my-4" />
            <span className="pb-4 text-[#2972A5] text-[24px] font-[500]">Mission</span>
            <p className="text-[16px] font-manrope leading-[170%]">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam
              erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci
              tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
              consequat.
            </p>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* NEW: “Discuss with us” Section (matches your screenshot)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#C7D9E6]">
        <div className="w-[95%] lg:w-[75%] mx-auto py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">

            {/* Left: Heading + copy + form */}
            <div className="max-w-xl">
              <h2 className="text-[#0E283A] font-manrope font-[700] leading-tight
                              text-[28px] sm:text-[32px] lg:text-[40px]">
                You have something to<br className="hidden sm:block" />
                discuss with us ??
              </h2>

              <p className="mt-3 text-[#0E283A]/80 max-w-lg">
                Drop your Email address and Phone number, will we reach you with
                handful offers
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="h-11 rounded-md px-4 bg-white/60 placeholder-slate-500
                               text-slate-800 w-full outline-none focus:ring-2 ring-[#2972A5]/40"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Mail id"
                    className="h-11 rounded-md px-4 bg-white/60 placeholder-slate-500
                               text-slate-800 w-full outline-none focus:ring-2 ring-[#2972A5]/40"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    className="h-11 rounded-md px-4 bg-white/60 placeholder-slate-500
                               text-slate-800 w-full outline-none focus:ring-2 ring-[#2972A5]/40"
                  />
                  <input
                    type="text"
                    name="business"
                    placeholder="Business"
                    className="h-11 rounded-md px-4 bg-white/60 placeholder-slate-500
                               text-slate-800 w-full outline-none focus:ring-2 ring-[#2972A5]/40"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center
                             rounded-full h-12 px-10 bg-[#2A6EA0] text-white
                             font-medium hover:bg-[#235E89] transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>

            {/* Right: big image placeholder box */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-[220px] sm:w-[260px] lg:w-[320px] aspect-square
                              bg-white/40 rounded-[24px] flex items-center justify-center">
                {/* simple placeholder icon */}
                <div className="w-[70%] aspect-square bg-white/70 rounded-[22px] flex items-center justify-center">
                  <svg
                    viewBox="0 0 64 64"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-2/3 h-2/3 opacity-70"
                  >
                    <rect x="8" y="8" width="48" height="48" rx="8" fill="#E6EEF4" />
                    <circle cx="24" cy="26" r="5" fill="#C9DCEB" />
                    <path d="M14 44l12-10c1-.9 2.6-.9 3.6 0L37 40l6-5c1-.9 2.6-.9 3.6 0L50 38v6H14z" fill="#C9DCEB" />
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* End new section */}
    </div>
  )
}

export default AboutUs
