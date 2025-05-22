"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { MoonIcon, SunIcon, User, MessageCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth"
import { useEffect } from "react"
import Cookies from "js-cookie"

export default function Header() {
  const t = useTranslations("header")
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "")
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, logout, token } = useAuth()
  
  const switchLocale = (newLocale: string) => {
    if (theme) {
      localStorage.setItem("app-theme", theme)
    }
    
    const oppositeLocale = locale === "ru" ? "en" : "ru"
    return `/${oppositeLocale}${pathnameWithoutLocale}`
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(`/${locale}/profile`)
  }

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(`/${locale}/chat`)
  }
  
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("app-theme", newTheme)
  }
  
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme")
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setTheme(savedTheme)
    }
  }, [setTheme])


  console.log(token, isAuthenticated, Cookies.get('auth-token'), 'isAuthenticated')

  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link 
            href={isAuthenticated ? `/${locale}/profile` : `/${locale}/auth/login`}
            className="text-lg font-bold"
          >
            TestApp
          </Link>
          
          {isAuthenticated && (
            <nav className="flex space-x-4">
              <a 
                href="#"
                onClick={handleProfileClick}
                className="flex items-center gap-1 hover:text-primary"
              >
                <User size={18} />
                <span>{t("profile")}</span>
              </a>
              <a 
                href="#"
                onClick={handleChatClick}
                className="flex items-center gap-1 hover:text-primary"
              >
                <MessageCircle size={18} />
                <span>{t("chat")}</span>
              </a>
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href={switchLocale(locale)} locale={locale === "ru" ? "en" : "ru"}>
            <Button variant="outline" size="icon">
              {locale === "ru" ? "EN" : "RU"}
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <SunIcon size={16} />
            ) : (
              <MoonIcon size={16} />
            )}
          </Button>
          
          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="flex items-center gap-1"
            >
              <LogOut size={16} />
              <span>{t("logout")}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 