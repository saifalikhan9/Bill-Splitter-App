import React, { Suspense } from 'react'
import AuthErrorPage from './Errors'
const page = () => {
  return (
    <Suspense fallback={<div className="w-full flex justify-center items-center min-h-screen">Loading...</div>}>
      <AuthErrorPage />
    </Suspense>
  )
}

export default page