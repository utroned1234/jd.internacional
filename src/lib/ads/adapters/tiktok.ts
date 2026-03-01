import { AdPlatform } from '@prisma/client'
import { IAdsAdapter, AdAccount, CampaignDraftPayload, PublishResult, MetricRow } from '../types'

export class TikTokAdapter implements IAdsAdapter {
    platform = AdPlatform.TIKTOK

    private clientKey = process.env.TIKTOK_CLIENT_KEY
    private clientSecret = process.env.TIKTOK_CLIENT_SECRET
    private redirectUri = process.env.TIKTOK_REDIRECT_URI

    getAuthUrl(state?: string): string {
        const scopes = ['ads.management', 'ads.stats']
        return `https://business-api.tiktok.com/portal/auth?app_id=${this.clientKey}&state=tt&redirect_uri=${this.redirectUri}`
    }

    async exchangeCodeForToken(code: string): Promise<any> {
        return {
            accessToken: 'mock_tiktok_token_' + Math.random(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            tokenType: 'Bearer'
        }
    }

    async refreshToken(refreshToken: string): Promise<any> {
        return { accessToken: 'mock_tiktok_refreshed_token' }
    }

    async listAdAccounts(accessToken: string): Promise<AdAccount[]> {
        return [
            { providerAccountId: 'tt_789', displayName: 'Mock TikTok Business', currency: 'USD', timezone: 'UTC' }
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
        console.log(`[TikTok] Publishing draft: ${draft.name}`)
        return {
            providerCampaignId: 'tt_camp_' + Date.now(),
            providerGroupId: 'tt_group_' + Date.now(),
            providerAdId: 'tt_ad_' + Date.now()
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
