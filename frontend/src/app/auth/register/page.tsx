"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center p-6">
        <h1 className="text-2xl font-bold mb-2">Phone OTP Disabled</h1>
        <p className="text-neutral-600 mb-4">
          Đăng ký bằng OTP điện thoại đã tắt. Vui lòng sử dụng đăng ký bằng email.
        </p>
        <Link href="/auth" className="text-blue-600 underline">
          Đi tới trang đăng ký email
        </Link>
      </div>
    </div>
  );
}
