import { AuthForm } from '@/components/auth-form'

export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  return <main className="auth-page"><AuthForm mode="sign-up" /></main>
}
