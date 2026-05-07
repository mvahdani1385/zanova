"use client"

import { useState, useEffect } from "react"

interface Code {
    id: number
    code: string
    length: number
    type: string
    isUsed: boolean
    usedBy: string | null
    createdAt: string
    batchId: string
    qrCode: string | null
    userFirstName: any
    userPhone: any
    userLastName: any
    userDescription: any
}

export default function ManageCodesPage() {
    const [codes, setCodes] = useState<Code[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [filterUsed, setFilterUsed] = useState("")
    const [filterBatch, setFilterBatch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [stats, setStats] = useState({ total: 0, used: 0, unused: 0 })
    const [batches, setBatches] = useState<string[]>([])
    const [message, setMessage] = useState("")
    const [showQRCode, setShowQRCode] = useState<number | null>(null)
    const [selectedCodes, setSelectedCodes] = useState<number[]>([])
    const [showBulkActions, setShowBulkActions] = useState(false)

    // دریافت کدها
    const fetchCodes = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "50",
                ...(search && { search }),
                ...(filterUsed && { isUsed: filterUsed }),
                ...(filterBatch && { batchId: filterBatch })
            })

            const res = await fetch(`/api/generate-codes?${params}`)
            const data = await res.json()

            if (res.ok) {
                setCodes(data.codes)
                setTotalPages(data.totalPages)
                setStats(data.stats)

                // استخراج دسته‌های منحصر به فرد
                const uniqueBatches = [...new Set(data.codes.map((c: Code) => c.batchId))]
                setBatches(uniqueBatches)
            }
        } catch (error) {
            console.error("خطا:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCodes()
    }, [currentPage, search, filterUsed, filterBatch])

    // حذف همه کدها
    const deleteAllCodes = async () => {
        if (!confirm("⚠️ آیا از حذف تمام کدها مطمئن هستید؟ این عمل غیرقابل بازگشت است!")) return

        try {
            const res = await fetch(`/api/generate-codes?deleteAll=true`, {
                method: "DELETE"
            })

            if (res.ok) {
                setMessage("✅ تمام کدها حذف شدند")
                fetchCodes()
                setTimeout(() => setMessage(""), 3000)
            }
        } catch (error) {
            setMessage("❌ خطا در حذف کدها")
        }
    }

    // حذف دسته خاص
    const deleteBatch = async (batchId: string) => {
        if (!confirm(`❓ آیا از حذف دسته ${batchId.substring(0, 20)}... مطمئن هستید؟`)) return

        try {
            const res = await fetch(`/api/generate-codes?batchId=${batchId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setMessage("✅ دسته کدها حذف شد")
                fetchCodes()
                setTimeout(() => setMessage(""), 3000)
            }
        } catch (error) {
            setMessage("❌ خطا در حذف دسته")
        }
    }

    // حذف کد تکی
    const deleteCode = async (codeId: number) => {
        if (!confirm("آیا مطمئن هستید؟")) return

        try {
            const res = await fetch(`/api/generate-codes?codeId=${codeId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setMessage("✅ کد حذف شد")
                fetchCodes()
                setTimeout(() => setMessage(""), 3000)
            }
        } catch (error) {
            setMessage("❌ خطا در حذف")
        }
    }

    // حذف چندتایی
    const deleteSelected = async () => {
        if (!confirm(`آیا از حذف ${selectedCodes.length} کد انتخاب شده مطمئن هستید؟`)) return

        for (const codeId of selectedCodes) {
            await fetch(`/api/generate-codes?codeId=${codeId}`, { method: "DELETE" })
        }

        setMessage(`✅ ${selectedCodes.length} کد حذف شدند`)
        setSelectedCodes([])
        setShowBulkActions(false)
        fetchCodes()
        setTimeout(() => setMessage(""), 3000)
    }

    // علامت‌زدن استفاده شده
    const markAsUsed = async (codeId: number) => {
        try {
            const res = await fetch("/api/generate-codes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codeId, isUsed: true, usedBy: "ادمین" })
            })

            if (res.ok) {
                setMessage("✅ وضعیت کد بروزرسانی شد")
                fetchCodes()
                setTimeout(() => setMessage(""), 3000)
            }
        } catch (error) {
            setMessage("❌ خطا در بروزرسانی")
        }
    }

    // کپی کد
    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code)
        setMessage("📋 کد کپی شد!")
        setTimeout(() => setMessage(""), 2000)
    }

    // دانلود QR Code
    const downloadQRCode = (qrCodeDataUrl: string, code: string) => {
        const link = document.createElement("a")
        link.href = qrCodeDataUrl
        link.download = `qrcode_${code}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // خروجی Excel

    // انتخاب همه
    const selectAll = () => {
        if (selectedCodes.length === codes.length) {
            setSelectedCodes([])
        } else {
            setSelectedCodes(codes.map(c => c.id))
        }
    }

    // تابع خروجی CSV (فقط کد و آدرس)
    const exportToCSV = () => {
        // دامنه فعلی رو از مرورگر میگیریم
        const domain = window.location.origin

        const headers = ["کد", "آدرس صفحه"]
        const rows = codes.map(code => [
            code.code,
            `${domain}/code/${code.code}`
        ])

        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n")
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.href = url
        link.setAttribute("download", `codes_${new Date().toISOString().slice(0, 19)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setMessage("📥 فایل CSV دانلود شد")
        setTimeout(() => setMessage(""), 3000)
    }

    // تابع خروجی XML (فقط کد و آدرس)
    const exportToXML = () => {
        const domain = window.location.origin

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
        xml += `<codes>\n`
        xml += `  <info>\n`
        xml += `    <generatedAt>${new Date().toISOString()}</generatedAt>\n`
        xml += `    <totalCodes>${codes.length}</totalCodes>\n`
        xml += `  </info>\n`
        xml += `  <codesList>\n`

        codes.forEach((code, index) => {
            xml += `    <code index="${index + 1}">\n`
            xml += `      <value>${escapeXml(code.code)}</value>\n`
            xml += `      <url>${domain}/code/${code.code}</url>\n`
            xml += `    </code>\n`
        })

        xml += `  </codesList>\n`
        xml += `</codes>`

        const blob = new Blob([xml], { type: "application/xml" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.href = url
        link.setAttribute("download", `codes_${new Date().toISOString().slice(0, 19)}.xml`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setMessage("📥 فایل XML دانلود شد")
        setTimeout(() => setMessage(""), 3000)
    }

    // تابع escapeXml (همون قبلی، برای XML)
    const escapeXml = (str: string) => {
        if (!str) return ""
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;")
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* هدر */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">مدیریت کدها</h1>
                        <p className="text-gray-600 mt-2">مشاهده، جستجو و مدیریت کدهای تولید شده به همراه QR Code</p>
                    </div>
                    <button
                        onClick={deleteAllCodes}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        🗑️ حذف همه کدها
                    </button>
                </div>

                {/* پیام */}
                {message && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {message}
                    </div>
                )}

                {/* کارتهای آماری */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
                        <div className="text-gray-600 mt-1">کل کدها</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-green-600">{stats.unused.toLocaleString()}</div>
                        <div className="text-gray-600 mt-1">استفاده نشده</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-3xl font-bold text-blue-600">{stats.used.toLocaleString()}</div>
                        <div className="text-gray-600 mt-1">استفاده شده</div>
                    </div>
                </div>

                {/* فیلترها */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="جستجوی کد..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        />
                        <select
                            value={filterUsed}
                            onChange={(e) => setFilterUsed(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        >
                            <option value="">همه کدها</option>
                            <option value="true">استفاده شده</option>
                            <option value="false">استفاده نشده</option>
                        </select>
                        <select
                            value={filterBatch}
                            onChange={(e) => setFilterBatch(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                        >
                            <option value="">همه دسته‌ها</option>
                            {batches.map(batch => (
                                <option key={batch} value={batch}>
                                    {batch.substring(0, 30)}...
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={exportToCSV}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                CSV
                            </button>
                            <button
                                onClick={exportToXML}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                XML
                            </button>
                        </div>
                    </div>
                </div>

                {/* عملیات دسته‌جمعی */}
                {selectedCodes.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-4 mb-8 flex justify-between items-center">
                        <span>{selectedCodes.length} کد انتخاب شده</span>
                        <div className="space-x-2">
                            <button
                                onClick={deleteSelected}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                حذف انتخاب شده‌ها
                            </button>
                            <button
                                onClick={() => setSelectedCodes([])}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                )}

                {/* جدول کدها */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">در حال بارگذاری...</div>
                    ) : codes.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>هیچ کدی یافت نشد</p>
                            <a href="/admin/generate-codes" className="text-blue-600 hover:underline mt-2 inline-block">
                                برای تولید کد جدید کلیک کنید
                            </a>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCodes.length === codes.length && codes.length > 0}
                                                    onChange={selectAll}
                                                    className="rounded"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کد</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طول</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام و نام خانوادگی</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شماره تماس</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تایید شده توسط</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ تایید</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">QR Code</th>
                                            {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">دسته</th> */}
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {codes.map((code) => (
                                            <tr key={code.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCodes.includes(code.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedCodes([...selectedCodes, code.id])
                                                            } else {
                                                                setSelectedCodes(selectedCodes.filter(id => id !== code.id))
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => copyToClipboard(code.code)}
                                                        className="font-mono text-sm text-blue-600 hover:text-blue-800"
                                                        title="کلیک برای کپی"
                                                    >
                                                        {code.code}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-sm">{code.length}</td>
                                                <td className="px-6 py-4 text-sm">{code.type}</td>
                                                <td className="px-6 py-4">
                                                    {code.userFirstName ? (
                                                        <div>
                                                            <div className="font-medium">{code.userFirstName} {code.userLastName}</div>
                                                            <div className="text-xs text-gray-500 mt-1">{code.userDescription?.substring(0, 50)}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">ثبت نشده</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {code.userPhone ? (
                                                        <span className="font-mono text-sm">{code.userPhone}</span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">ثبت نشده</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${code.isUsed
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}>
                                                        {code.isUsed ? "✓ ثبت شده" : "⏳ در انتظار"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {code.confirmedBySellerName || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {code.confirmedAt ? new Date(code.confirmedAt).toLocaleDateString("fa-IR") : "-"}
                                                </td>
                                                {/* <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${code.isUsed
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-green-100 text-green-800"
                                                        }`}>
                                                        {code.isUsed ? "استفاده شده" : "استفاده نشده"}
                                                    </span>
                                                </td> */}
                                                <td className="px-6 py-4">
                                                    {code.qrCode ? (
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setShowQRCode(showQRCode === code.id ? null : code.id)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                            >
                                                                {showQRCode === code.id ? "🔽 مخفی کردن" : "🔼 نمایش QR"}
                                                            </button>
                                                            {showQRCode === code.id && (
                                                                <div className="absolute top-8 left-0 z-10 bg-white p-4 shadow-xl rounded-lg border">
                                                                    <img src={code.qrCode} alt="QR Code" className="w-32 h-32" />
                                                                    <button
                                                                        onClick={() => downloadQRCode(code.qrCode!, code.code)}
                                                                        className="mt-2 text-xs bg-gray-800 text-white px-2 py-1 rounded"
                                                                    >
                                                                        دانلود QR
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">ندارد</span>
                                                    )}
                                                </td>
                                                {/* <td className="px-6 py-4 text-xs">
                                                    <div className="tooltip" title={code.batchId}>
                                                        {code.batchId.substring(0, 15)}...
                                                    </div>
                                                    <button
                                                        onClick={() => deleteBatch(code.batchId)}
                                                        className="text-red-600 hover:text-red-800 text-xs ml-2"
                                                        title="حذف این دسته"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td> */}
                                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                                    {/* {!code.isUsed && (
                                                        <button
                                                            onClick={() => markAsUsed(code.id)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                                                        >
                                                            استفاده شد
                                                        </button>
                                                    )} */}
                                                    <button
                                                        onClick={() => window.open(`/code/${code.code}`, '_blank')}
                                                        className="text-purple-600 hover:text-purple-800 text-sm ml-2"
                                                        title="مشاهده صفحه کد"
                                                    >
                                                        ثبت
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCode(code.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        حذف
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 flex justify-between items-center border-t">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                    >
                                        قبلی
                                    </button>
                                    <span>صفحه {currentPage} از {totalPages}</span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                                    >
                                        بعدی
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}