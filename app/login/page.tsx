"use client"

import LoginForm from "@/components/biz/LoginForm/LoginForm"
import { useState } from "react"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  return (
    <LoginForm
      loading={loading}
      onGithubSignIn={() => {
        setLoading(true)
        signIn("github", { callbackUrl: "/main" })
      }}
    />
  )
}