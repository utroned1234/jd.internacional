import { AdPlatform } from '@prisma/client'
import { IAdsAdapter, AdAccount, CampaignDraftPayload, PublishResult, MetricRow } from '../types'

export class GoogleAdsAdapter implements IAdsAdapter {
    platform = AdPlatform.GOOGLE_ADS

    private clientId = process.env.GOOGLE_CLIENT_ID
    private clientSecret = process.env.GOOGLE_CLIENT_SECRET
    private developerToken = process.env.GOOGLE_DEVELOPER_TOKEN
    private redirectUri = process.env.GOOGLE_REDIRECT_URI

    getAuthUrl(state?: string): string {
        const scopes = ['https://www.googleapis.com/auth/adwords']
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=${scopes.join(' ')}&response_type=code&access_type=offline&prompt=consent`
    }

    async exchangeCodeForToken(code: string): Promise<any> {
        return {
            accessToken: 'mock_google_token_' + Math.random(),
            refreshToken: 'mock_google_refresh_' + Math.random(),
            expiresAt: new Date(Date.now() + 3599 * 1000), // ~1 hour
            tokenType: 'Bearer'
        }
    }

    async refreshToken(refreshToken: string): Promise<any> {
        return { accessToken: 'mock_google_refreshed_token' }
    }

    async listAdAccounts(accessToken: string): Promise<AdAccount[]> {
        return [
            { providerAccountId: '123-456-7890', displayName: 'Mock Google Account', currency: 'USD', timezone: 'America/New_York' }
        ]
    }

    async listPages(accessToken: string): Promise<any[]> {
        return []
    }

    async listPixels(accessToken: string, adAccountId: string): Promise<any[]> {
        return []
    }

    async listPagePosts(accessToken: string, pageId: string): Promise<any[]> {
        return []
    }

    async publishFromDraft(accessToken: string, adAccountId: string, draft: CampaignDraftPayload): Promise<PublishResult> {
        console.log(`[GoogleAds] Publishing draft: ${draft.name}`)
        return {
            providerCampaignId: 'goog_camp_' + Date.now(),
            providerGroupId: 'goog_ag_' + Date.now(),
            providerAdId: 'goog_ad_' + Date.now()
        }
    }

    async pauseCampaign(accessToken: string, adAccountId: string, providerCampaignId: string): Promise<boolean> {
        return true
    }

    async resumeCampaign(accessToken: string, adAccountId: string, providerCampaignId: string): Promise<boolean> {
        return true
    }

    async fetchDailyMetrics(accessToken: string, adAccountId: string, from: Date, to: Date): Promise<MetricRow[]> {
        return []
    }
}
