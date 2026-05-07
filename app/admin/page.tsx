"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getToken } from "../../utils/auth"

export default function AdminDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState({
        totalCodes: 0,
        usedCodes: 0,
        unusedCodes: 0,
        totalUsers: 0,
        totalSellers: 0,
        totalAdmins: 0
    })

    useEffect(() => {
        const currentUser = getCurrentUser()
        const token = getToken()
        
        if (!currentUser || !token) {
            router.push("/login")
            return
        }
        
        if (currentUser.role !== "owner" && currentUser.role !== "admin") {
            router.push("/dashboard")
            return
        }
        
        setUser(currentUser)
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const token = getToken()
            
            // دریافت آمار کدها
            const codesRes = await fetch("/api/generate-codes?page=1&limit=1", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const codesData = await codesRes.json()
            
            if (codesData.stats) {
                setStats(prev => ({
                    ...prev,
                    totalCodes: codesData.stats.total || 0,
                    usedCodes: codesData.stats.used || 0,
                    unusedCodes: codesData.stats.unused || 0
                }))
            }
            
            // دریافت آمار کاربران (فقط برای مالک)
            if (user?.role === "owner") {
                const usersRes = await fetch("/api/users", {
                    headers: { "Authorization": `Bearer ${token}` }
                })
                const usersData = await usersRes.json()
                
                if (Array.isArray(usersData)) {
                    setStats(prev => ({
                        ...prev,
                        totalUsers: usersData.length,
                        totalSellers: usersData.filter((u: any) => u.role === "seller").length,
                        totalAdmins: usersData.filter((u: any) => u.role === "admin" || u.role === "owner").length
                    }))
                }
            }
        } catch (error) {
            console.error("خطا در دریافت آمار:", error)
        }
    }

    // منوی اصلی (مشترک بین ادمین و مالک)
    const baseMenuItems = [
        {
            title: "مدیریت کدها",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            description: "مشاهده، جستجو و مدیریت کدهای تولید شده",
            href: "/admin/manage-codes",
            color: "bg-blue-500"
        },
        {
            title: "تولید کد جدید",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            description: "تولید کدهای تصادفی با طول و نوع دلخواه",
            href: "/admin/generate-codes",
            color: "bg-green-500"
        },
        {
            title: "افزودن کاربر جدید",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            description: "ایجاد کاربر جدید با نقش فروشنده یا ادمین",
            href: "/admin/users",
            color: "bg-indigo-500"
        },
        {
            title: "تنظیمات دامنه",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            description: "تغییر آدرس دامنه برای ساخت QR Code",
            href: "/admin/settings",
            color: "bg-gray-500"
        }
    ]

    // منوی مخصوص مالک
    const ownerMenuItems = [
        {
            title: "مدیریت کاربران",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            description: "مشاهده، ویرایش و حذف کاربران سیستم",
            href: "/admin/manage-users",
            color: "bg-purple-500"
        }
    ]

    // ترکیب منوها بر اساس نقش
    const menuItems = user?.role === "owner" 
        ? [...baseMenuItems, ...ownerMenuItems]
        : baseMenuItems

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* هدر */}
            <div className="bg-gray-900 text-white py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">پنل مدیریت</h1>
                            <p className="text-gray-300 mt-2">
                                خوش آمدید {user.firstName} {user.lastName}
                            </p>
                        </div>
                        <div className="text-left">
                            <div className="text-sm text-gray-400">نقش شما</div>
                            <div className="text-xl font-semibold">
                                {user.role === "owner" ? "👑 مالک" : "⚙️ ادمین"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* کارت‌های آمار */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">کل کدها</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalCodes.toLocaleString()}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between text-sm">
                            <span className="text-green-600">استفاده شده: {stats.usedCodes.toLocaleString()}</span>
                            <span className="text-yellow-600">استفاده نشده: {stats.unusedCodes.toLocaleString()}</span>
                        </div>
                    </div>

                    {user?.role === "owner" && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">کل کاربران</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                                </div>
                                <div className="bg-purple-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between text-sm">
                                <span className="text-blue-600">ادمین‌ها: {stats.totalAdmins}</span>
                                <span className="text-green-600">فروشنده‌ها: {stats.totalSellers}</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">درصد استفاده</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats.totalCodes > 0 
                                        ? Math.round((stats.usedCodes / stats.totalCodes) * 100) 
                                        : 0}%
                                </p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${stats.totalCodes > 0 ? (stats.usedCodes / stats.totalCodes) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">تاریخ امروز</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Date().toLocaleDateString("fa-IR")}
                                </p>
                            </div>
                            <div className="bg-gray-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            {new Date().toLocaleTimeString("fa-IR")}
                        </div>
                    </div>
                </div>

                {/* منوی کارت‌ها */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">بخش‌های مدیریتی</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => window.location.href = item.href}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-right cursor-pointer"
                        >
                            <div className={`${item.color} p-4 text-white`}>
                                <div className="flex justify-between items-center">
                                    <div className="bg-white bg-opacity-30 rounded-lg p-2">
                                        {item.icon}
                                    </div>
                                    <span className="text-sm opacity-80">
                                        ورود →
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {item.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* یوتیلیتی بار */}
                <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">دسترسی سریع</h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => window.location.href = "/admin/generate-codes"}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                        >
                            🎲 تولید کد جدید
                        </button>
                        <button
                            onClick={() => window.location.href = "/admin/manage-codes"}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                        >
                            📋 مدیریت کدها
                        </button>
                        {user?.role === "owner" && (
                            <button
                                onClick={() => window.location.href = "/admin/manage-users"}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
                            >
                                👥 مدیریت کاربران
                            </button>
                        )}
                        <button
                            onClick={() => window.location.href = "/admin/settings"}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer"
                        >
                            ⚙️ تنظیمات دامنه
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}