import Link from 'next/link'

export const metadata = { title: 'Privacy Policy · Cloud Empire AI', description: 'How Cloud Empire AI handles account and workspace data.' }

export default function PrivacyPage() {
  return <main className="legal-page"><div className="legal-card"><span className="eyebrow">CLOUD EMPIRE AI</span><h1>Privacy Policy</h1><p className="legal-lede">We collect only what is needed to provide your workspace, authentication, telemetry views, and security features.</p><section><h2>Data we handle</h2><p>Account identifiers, workspace configuration, operational events, and security logs. Passwords are hashed by Better Auth and are never displayed to the application.</p></section><section><h2>How we use it</h2><p>We use this data to authenticate you, protect workspace resources, display usage metrics, and diagnose reliability issues. We do not sell personal data.</p></section><section><h2>Retention and deletion</h2><p>Operational records are retained only as long as needed for the workspace. You may request deletion of your account and associated workspace data.</p></section><section><h2>Security</h2><p>Sessions use secure cookies, server-side authorization, parameterized database queries, and least-privilege access patterns.</p></section><Link href="/sign-in">Back to sign in</Link></div></main>
}
