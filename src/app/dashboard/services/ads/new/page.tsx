import { redirect } from 'next/navigation'

// This page is replaced by the new AI-powered campaign flow.
// Redirect to the strategy catalog.
export default function NewAdDraftRedirect() {
    redirect('/dashboard/services/ads/strategies')
}
