"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { useAuth } from "@/lib/auth"
import Cookies from "js-cookie"

export default function HomePage() {
  const router = useRouter()
  const locale = useLocale()
  const { isAuthenticated } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  useEffect(() => {
    const authToken = Cookies.get('auth-token')
    const isTokenPresent = authToken || isAuthenticated
    
    const redirectPath = isTokenPresent 
      ? `/${locale}/profile` 
      : `/${locale}/auth/login`
    
    router.push(redirectPath)
    
    const redirectTimeout = setTimeout(() => {
      setIsRedirecting(false)
    }, 3000)
    
    return () => clearTimeout(redirectTimeout)
  }, [router, isAuthenticated, locale])
  
  return (
    <div className="flex justify-center items-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-lg">Перенаправление...</p>
        {!isRedirecting && (
          <p className="mt-2 text-sm text-muted-foreground">
            Если вы не были перенаправлены автоматически, пожалуйста, 
            <button 
              onClick={() => window.location.reload()} 
              className="text-primary ml-1 hover:underline"
            >
              обновите страницу
            </button>
          </p>
        )}
      </div>
    </div>
  )
} 