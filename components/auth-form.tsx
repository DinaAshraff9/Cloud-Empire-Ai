'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') || '')
    const password = String(data.get('password') || '')
    const name = String(data.get('name') || '')
    const result = mode === 'sign-up'
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })
    setPending(false)
    if (result.error) {
      setError('تعذر إتمام العملية. تحقق من البيانات وحاول مرة أخرى.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return <form className="auth-form" onSubmit={submit}>
    <div><span className="eyebrow">Cloud Empire AI</span><h1>{mode === 'sign-in' ? 'Welcome back' : 'Create your workspace'}</h1><p>{mode === 'sign-in' ? 'Sign in to manage your infrastructure.' : 'Start managing your cloud operations securely.'}</p></div>
    {mode === 'sign-up' && <label>Name<input name="name" required autoComplete="name" /></label>}
    <label>Email<input name="email" type="email" required autoComplete="email" /></label>
    <label>Password<input name="password" type="password" minLength={8} required autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} /></label>
    {error && <p role="alert" className="auth-error">{error}</p>}
    <button type="submit" disabled={pending}>{pending ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}</button>
    <a href={mode === 'sign-in' ? '/sign-up' : '/sign-in'}>{mode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</a>
  </form>
}
