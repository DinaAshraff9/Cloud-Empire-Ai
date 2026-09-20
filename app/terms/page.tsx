import Link from 'next/link'

export const metadata = { title: 'Terms of Service · Cloud Empire AI', description: 'Terms for using the Cloud Empire AI workspace.' }

export default function TermsPage() {
  return <main className="legal-page"><div className="legal-card"><span className="eyebrow">CLOUD EMPIRE AI</span><h1>Terms of Service</h1><p className="legal-lede">By using Cloud Empire AI, you agree to use the workspace responsibly and keep your account credentials secure.</p><section><h2>Acceptable use</h2><p>Do not use the service to abuse infrastructure, probe systems without authorization, upload malicious content, or bypass access controls.</p></section><section><h2>Workspace responsibility</h2><p>You are responsible for the accuracy of workspace data, invited members, and actions performed under your account. Server-side permissions apply to every protected mutation.</p></section><section><h2>Free service</h2><p>This project provides operational usage views and demo infrastructure workflows. It does not process payments, collect billing details, or promise availability of external cloud resources.</p></section><section><h2>Changes</h2><p>We may update these terms as the product evolves. Continued use after an update means you accept the revised terms.</p></section><Link href="/sign-in">Back to sign in</Link></div></main>
}
