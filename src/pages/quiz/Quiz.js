import React from 'react'
import Banner from '../../components/quizcomponents/Banner'
import QuizBlocks from '../../components/quizcomponents/QuizBlocks'


function Quiz() {
  return (
    <div className='w-[90%] mx-auto'>
        <Banner />
        <QuizBlocks />
    </div>
  )
}

export default Quiz