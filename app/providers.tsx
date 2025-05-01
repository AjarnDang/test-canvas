'use client'

import React, { useState, useEffect } from 'react'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <div suppressHydrationWarning className='min-h-screen'>
      {children}
    </div>
  )
} 