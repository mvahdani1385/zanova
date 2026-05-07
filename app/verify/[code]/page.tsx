"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function VerifyPage() {
    const { code } = useParams()
    const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "used">("loading")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (code) {
            // اینجا می‌تونی وضعیت کد رو چک کنی
            // و اگر معتبر بود، علامت استفاده شده بزنی
            verifyCode(code as string)
        }
    }, [code])

    const verifyCode = async (codeValue: string) => {
        try {
            const res = await fetch(`/api/verify-code?code=${codeValue}`)
            const data = await res.json()
            
            if (data.valid && !data.isUsed) {
                setStatus("valid")
                setMessage("✅ کد معتبر است!")
                
                // علامت زدن به عنوان استفاده شده
                await fetch(`/api/verify-code`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: codeValue })
                })
            } else if (data.isUsed) {
                setStatus("used")
                setMessage("❌ این کد قبلاً استفاده شده است")
            } else {
                setStatus("invalid")
                setMessage("❌ کد نامعتبر است")
            }
        } catch (error) {
            setStatus("invalid")
            setMessage("❌ خطا در بررسی کد")
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {status === "loading" && (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">در حال بررسی کد...</p>
                    </div>
                )}

                {status === "valid" && (
                    <div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mt-4">کد معتبر است!</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                    </div>
                )}

                {(status === "invalid" || status === "used") && (
                    <div>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mt-4">{message}</h2>
                    </div>
                )}
            </div>
        </div>
    )
}