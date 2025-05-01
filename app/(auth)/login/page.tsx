import React, { Suspense } from 'react'
import SignInPage from './Login'

const page = () => {
  return (
    <Suspense fallback={<div className="w-full flex justify-center items-center min-h-screen">Loading...</div>}>
     <SignInPage />
    </Suspense>
  )
}

export default page