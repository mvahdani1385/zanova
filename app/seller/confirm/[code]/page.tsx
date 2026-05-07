"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getToken, getCurrentUser } from "../../../../utils/auth"

export default function SellerConfirmPage() {
    const params = useParams()
    const router = useRouter()
    const code = params.code as string

    const [loading, setLoading] = useState(true)
    const [codeData, setCodeData] = useState<any>(null)
    const [message, setMessage] = useState("")
    const [confirming, setConfirming] = useState(false)

    useEffect(() => {
        // چک کردن لاگین بودن و نقش فروشنده
        const user = getCurrentUser()
        const token = getToken()

        if (!user || !token) {
            router.push("/login")
            return
        }

        if (user.role !== "seller") {
            router.push("/dashboard")
            return
        }

        fetchCodeInfo()
    }, [code])

    const fetchCodeInfo = async () => {
        try {
            const token = getToken()
            const res = await fetch(`/api/confirm-code/${code}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json()

            if (res.ok) {
                setCodeData(data.code)
            } else {
                setMessage(data.error || "خطا در دریافت اطلاعات")
                setTimeout(() => router.push("/dashboard"), 2000)
            }
        } catch (error) {
            setMessage("❌ خطا در ارتباط با سرور")
        } finally {
            setLoading(false)
        }
    }

    const handleConfirm = async () => {
        setConfirming(true)
        setMessage("")

        try {
            const token = getToken()
            const res = await fetch(`/api/confirm-code/${code}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            const data = await res.json()

            if (res.ok) {
                setMessage("✅ کد با موفقیت تایید شد!")
                setCodeData({ ...codeData, isUsed: true })
                setTimeout(() => {
                    router.push("/dashboard")
                }, 2000)
            } else {
                setMessage(`❌ ${data.error}`)
            }
        } catch (error) {
            setMessage("❌ خطا در تایید کد")
        } finally {
            setConfirming(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        )
    }

    if (!codeData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">!</div>
                    <h2 className="text-2xl font-bold text-gray-900">کد یافت نشد</h2>
                    <p className="text-gray-600 mt-2">{message}</p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                        بازگشت به داشبورد
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* هدر */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">تایید کد</h1>
                    <p className="mt-2 text-gray-600">
                        کد: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{code}</span>
                    </p>
                </div>

                {/* پیام */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-center ${
                        message.includes("✅") 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                    }`}>
                        {message}
                    </div>
                )}

                {/* اطلاعات کد */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="border-b pb-4">
                            <h2 className="text-xl font-semibold text-gray-900">اطلاعات کاربر (مالک کد)</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {codeData.userFirstName ? (
                                <>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-sm text-gray-500">نام</div>
                                        <div className="text-lg font-medium text-gray-900">{codeData.userFirstName}</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-sm text-gray-500">نام خانوادگی</div>
                                        <div className="text-lg font-medium text-gray-900">{codeData.userLastName}</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-sm text-gray-500">شماره تماس</div>
                                        <div className="text-lg font-medium text-gray-900 font-mono">{codeData.userPhone}</div>
                                    </div>
                                    {codeData.userDescription && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-sm text-gray-500">توضیحات</div>
                                            <div className="text-lg font-medium text-gray-900">{codeData.userDescription}</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                    <p className="text-yellow-800">هنوز اطلاعاتی برای این کد ثبت نشده است</p>
                                </div>
                            )}
                        </div>

                        {/* وضعیت کد */}
                        <div className="border-t pt-4">
                            <div className={`rounded-lg p-4 text-center ${
                                codeData.isUsed 
                                    ? "bg-red-50 text-red-700" 
                                    : "bg-green-50 text-green-700"
                            }`}>
                                {codeData.isUsed ? (
                                    <>
                                        <p className="font-semibold">❌ این کد قبلاً استفاده شده است</p>
                                        {codeData.confirmedBySellerName && (
                                            <p className="text-sm mt-2">
                                                تایید شده توسط: {codeData.confirmedBySellerName}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="font-semibold">✅ این کد معتبر و آماده تایید است</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* دکمه تایید */}
                    {!codeData.isUsed && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <button
                                onClick={handleConfirm}
                                disabled={confirming}
                                className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
                            >
                                {confirming ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        در حال تایید...
                                    </span>
                                ) : (
                                    "✅ تایید و استفاده از کد"
                                )}
                            </button>
                        </div>
                    )}

                    {/* دکمه بازگشت */}
                    <div className="px-6 py-4">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="w-full text-gray-600 hover:text-gray-800 transition"
                        >
                            ← بازگشت به داشبورد
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}