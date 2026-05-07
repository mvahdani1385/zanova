"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Html5QrcodeScanner } from "html5-qrcode"
import { getToken, getCurrentUser } from "../../utils/auth"

export default function ScannerPage() {
    const router = useRouter()
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        // چک کردن لاگین بودن کاربر
        const currentUser = getCurrentUser()
        const token = getToken()
        
        if (!currentUser || !token) {
            router.push("/login")
            return
        }
        
        setUser(currentUser)
        startScanner()
        
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear()
            }
        }
    }, [])

    const startScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear()
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
            },
            false
        )

        scannerRef.current = scanner

        scanner.render(
            (decodedText) => {
                // اسکن موفق
                scanner.clear()
                setResult(decodedText)
                handleScannedCode(decodedText)
            },
            (error) => {
                // خطا در اسکن (نادیده گرفته میشه)
                console.log("Scan error:", error)
            }
        )
        
        setScanning(true)
    }

    const handleScannedCode = async (scannedCode: string) => {
        setLoading(true)
        setMessage("")

        try {
            // استخراج کد از URL (اگه کل URL اسکن شده باشه)
            let code = scannedCode
            if (scannedCode.includes("/code/")) {
                code = scannedCode.split("/code/").pop() || scannedCode
            }
            
            console.log("Scanned code:", code)
            
            // 1. چک کردن وجود کد در دیتابیس
            const checkRes = await fetch(`/api/code-info/${code}`)
            const checkData = await checkRes.json()
            
            if (!checkRes.ok || !checkData.success) {
                setMessage("❌ کد یافت نشد!")
                setTimeout(() => {
                    restartScanner()
                }, 2000)
                return
            }
            
            // 2. بررسی نقش کاربر
            const currentUser = getCurrentUser()
            
            if (currentUser?.role === "owner" || currentUser?.role === "admin") {
                // ادمین یا مالک: هدایت به صفحه کد
                setMessage("✅ کد معتبر است! در حال هدایت...")
                setTimeout(() => {
                    window.location.href = `/code/${code}`
                }, 1000)
            } else {
                // فروشنده: هدایت به داشبورد
                setMessage("👋 شما به عنوان فروشنده به داشبورد هدایت می‌شوید")
                setTimeout(() => {
                    router.push(`/seller/confirm/${code}`)
                }, 1000)
            }
            
        } catch (error) {
            console.error("Error:", error)
            setMessage("❌ خطا در بررسی کد")
            setTimeout(() => {
                restartScanner()
            }, 2000)
        } finally {
            setLoading(false)
        }
    }

    const restartScanner = () => {
        setResult("")
        setMessage("")
        setScanning(false)
        startScanner()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* هدر */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">اسکن QR Code</h1>
                    <p className="mt-2 text-gray-600">
                        دوربین را روی QR Code بگیرید
                    </p>
                    {user && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                            <span className="text-sm text-gray-600">
                                نقش: {
                                    user.role === "owner" ? "👑 مالک" :
                                    user.role === "admin" ? "⚙️ ادمین" : "🛒 فروشنده"
                                }
                            </span>
                        </div>
                    )}
                </div>

                {/* پیام */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-center ${
                        message.includes("✅") 
                            ? "bg-green-100 text-green-700 border border-green-200" 
                            : message.includes("❌")
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}>
                        {message}
                    </div>
                )}

                {/* اسکنر */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-4 text-gray-600">در حال بررسی کد...</p>
                        </div>
                    ) : (
                        <>
                            <div id="reader" className="w-full"></div>
                            
                            {result && !loading && (
                                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-600 text-center break-all">
                                        کد اسکن شده: <span className="font-mono">{result}</span>
                                    </p>
                                </div>
                            )}
                            
                            <div className="mt-6 text-center">
                                <button
                                    onClick={restartScanner}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                                >
                                    اسکن مجدد
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* راهنما */}
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        راهنما
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• دوربین را روی QR Code قرار دهید</li>
                        <li>• ادمین و مالک به صفحه اطلاعات کد هدایت می‌شوند</li>
                        <li>• فروشنده‌ها به داشبورد هدایت می‌شوند</li>
                        <li>• کدهای نامعتبر پیام خطا نمایش می‌دهند</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}