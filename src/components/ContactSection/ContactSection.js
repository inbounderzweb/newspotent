

import contactimg from '../../assets/newscontact.svg'

function ContactSection() {
  return (
    <div className='w-full lg:w-[75%] mx-auto py-24 px-2'>
      <div className='grid lg:flex gap-2 items-center mx-auto justify-between'>

    <div className='w-[100%] lg:w-[20%]'>
      <img src={contactimg} alt='contactsection-image' />
    </div>
        <div className='w-[100%] lg:w-[30%] hidden lg:block'>
          <span className='font-manrope text-[#0E283A] text-[25px] font-semibold leading-[120%]'>You have <br/>something to <br/>discuss with us ??</span> <br/>
          <span className='text-[16px] font-manrope leading-[120%] font-light'>Drop your Email address and <br/> Phone number, will we reach you <br/> with handful offers</span>
        </div>

          <div className='w-[100%] text-center block lg:hidden'>
          <span className='font-manrope text-[#0E283A] text-[25px] font-semibold leading-[120%]'>You have something to discuss with us ??</span> <br/>
          <span className='text-[16px] font-manrope leading-[120%] font-light'>Drop your Email address and  Phone number, will we reach you  with handful offers</span>
        </div>
    <div className='w-[100%] lg:w-[50%]'>


            <form>
              <div className='grid lg:flex gap-2'>
                <div className='gap-1 w-full lg:w-[50%]'>
                   <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-[#BDD3E3] my-1 placeholder-blue-400 rounded-lg py-2 px-4 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full bg-[#BDD3E3] my-1 placeholder-blue-400 rounded-lg py-2 px-4 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Mail id"
                className="w-full bg-[#BDD3E3] my-1 placeholder-blue-400 rounded-lg py-2 px-4 focus:outline-none"
              />
                </div>
              

                <div className='w-[100%] lg:w-[50%]'>
                        <textarea
              placeholder="Message / Comment"
              rows={4}
              className="w-full bg-[#BDD3E3] placeholder-blue-400 rounded-lg py-[20.5px] px-4 focus:outline-none"
            />
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition mx-auto text-center align-middle justify-center flex"
              >
                Submit
              </button>
                </div>


              </div>
             
        
          </form>



    </div>


      </div>
    </div>
  )
}

export default ContactSection