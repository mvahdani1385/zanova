"use client" // این خط مهمه

import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // از API خودت دیتا بگیر
    fetch("/api/users")
      .then(res => res.json())
      .then(setUsers)
  }, [])

  return (
    <div className="space-y-2">
      <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100 rounded">
        🚩 داشبورد
      </Link>
      <Link href="/admin/users" className="block px-4 py-2 hover:bg-gray-100 rounded">
        ➕ افزودن کاربر
      </Link>
      <Link href="/admin/manage-users" className="block px-4 py-2 hover:bg-gray-100 rounded">
        👥 مدیریت کاربران
      </Link>
      <Link href="/admin/generate-codes" className="block px-4 py-2 hover:bg-gray-100 rounded">
        🎲 تولید کد جدید
      </Link>
      <Link href="/admin/manage-codes" className="block px-4 py-2 hover:bg-gray-100 rounded">
        📋 مدیریت کدها
      </Link>
      <Link href="/scan" className="block px-4 py-2 hover:bg-gray-100 rounded flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        اسکن QR Code
      </Link>
      <Link href="/admin/settings" className="block px-4 py-2 hover:bg-gray-100 rounded">
        ⚙️ تنظیمات دامنه
      </Link>
    </div>
  )
}