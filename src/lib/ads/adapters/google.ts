import { AdPlatform } from '@prisma/client'
import { IAdsAdapter, AdAccount, CampaignDraftPayload, PublishResult, MetricRow } from '../types'

const GOOGLE_API_BASE = 'https://googleads.googleapis.com/v18'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export class GoogleAdsAdapter implements IAdsAdapter {
    platform = AdPlatform.GOOGLE_ADS

    private clientId = process.env.GOOGLE_CLIENT_ID
    private clientSecret = process.env.GOOGLE_CLIENT_SECRET
    private developerToken = process.env.GOOGLE_DEVELOPER_TOKEN
    private redirectUri = process.env.GOOGLE_REDIRECT_URI

    private headers(accessToken: string, loginCustomerId?: string): Record<string, string> {
        const h: Record<string, string> = {
            Authorization: `Bearer ${accessToken}`,
            'developer-token': this.developerToken!,
            'Content-Type': 'application/json',
        }
        if (loginCustomerId) h['login-customer-id'] = loginCustomerId
        return h
    }

    private cid(adAccountId: string): string {
        return adAccountId.replace(/-/g, '')
    }

    getAuthUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId!,
            redirect_uri: this.redirectUri!,
            scope: 'https://www.googleapis.com/auth/adwords',
            response_type: 'code',
            access_type: 'offline',
            prompt: 'consent',
            ...(state ? { state } : {})
        })
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    }

    async exchangeCodeForToken(code: string): Promise<any> {
        const res = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: this.clientId!,
                client_secret: this.clientSecret!,
                redirect_uri: this.redirectUri!,
                grant_type: 'authorization_code',
            }),
        })
        if (!res.ok) throw new Error(`Google token exchange failed: ${await res.text()}`)
        const data = await res.json()
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
            tokenType: data.token_type || 'Bearer',
        }
    }

    async refreshToken(refreshTokenValue: string): Promise<any> {
        const res = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                refresh_token: refreshTokenValue,
                client_id: this.clientId!,
                client_secret: this.clientSecret!,
                grant_type: 'refresh_token',
            }),
        })
        if (!res.ok) throw new Error(`Google token refresh failed: ${await res.text()}`)
        const data = await res.json()
        return {
            accessToken: data.access_token,
            expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        }
    }

    async listAdAccounts(accessToken: string): Promise<AdAccount[]> {
        const res = await fetch(`${GOOGLE_API_BASE}/customers:listAccessibleCustomers`, {
            headers: this.headers(accessToken),
        })
        if (!res.ok) throw new Error(`Google Ads listAdAccounts failed: ${await res.text()}`)
        const data = await res.json()
        const resourceNames: string[] = data.resourceNames || []

        const accounts = await Promise.all(
            resourceNames.slice(0, 20).map(async (resourceName: string) => {
                const customerId = resourceName.split('/')[1]
                try {
                    const detailRes = await fetch(`${GOOGLE_API_BASE}/${resourceName}`, {
                        headers: this.headers(accessToken, customerId),
                    })
                    if (!detailRes.ok) return null
                    const detail = await detailRes.json()
                    return {
                        providerAccountId: customerId,
                        displayName: detail.descriptiveName || customerId,
                        currency: detail.currencyCode || 'USD',
                        timezone: detail.timeZone || 'UTC',
                    }
                } catch {
                    return null
                }
            })
        )
        return accounts.filter(Boolean) as AdAccount[]
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
        const cid = this.cid(adAccountId)
        const headers = this.headers(accessToken, cid)
        const base = `${GOOGLE_API_BASE}/customers/${cid}`

        // 1. Create campaign budget
        const budgetRes = await fetch(`${base}/campaignBudgets:mutate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                operations: [{
                    create: {
                        name: `${draft.name} — Budget`,
                        amountMicros: String(Math.round(draft.budgetAmount * 1_000_000)),
                        deliveryMethod: 'STANDARD',
                    }
                }]
            })
        })
        if (!budgetRes.ok) throw new Error(`Google Ads budget failed: ${await budgetRes.text()}`)
        const budgetResourceName = (await budgetRes.json()).results?.[0]?.resourceName

        // 2. Create campaign
        const campaignRes = await fetch(`${base}/campaigns:mutate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                operations: [{
                    create: {
                        name: draft.name,
                        status: 'PAUSED',
                        advertisingChannelType: 'SEARCH',
                        campaignBudget: budgetResourceName,
                        networkSettings: {
                            targetGoogleSearch: true,
                            targetSearchNetwork: true,
                            targetContentNetwork: false,
                        },
                        biddingStrategyType: 'MAXIMIZE_CLICKS',
                    }
                }]
            })
        })
        if (!campaignRes.ok) throw new Error(`Google Ads campaign failed: ${await campaignRes.text()}`)
        const campaignResourceName = (await campaignRes.json()).results?.[0]?.resourceName
        const campaignId = campaignResourceName?.split('/').pop()

        // 3. Create ad group
        const adGroupRes = await fetch(`${base}/adGroups:mutate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                operations: [{
                    create: {
                        name: `${draft.name} — Ad Group`,
                        campaign: campaignResourceName,
                        status: 'ENABLED',
                        type: 'SEARCH_STANDARD',
                    }
                }]
            })
        })
        if (!adGroupRes.ok) throw new Error(`Google Ads ad group failed: ${await adGroupRes.text()}`)
        const adGroupResourceName = (await adGroupRes.json()).results?.[0]?.resourceName
        const adGroupId = adGroupResourceName?.split('/').pop()

        // 4. Build headlines and descriptions (responsive search ad)
        const headlines: Array<{ text: string }> = []
        if (draft.headline) headlines.push({ text: draft.headline.slice(0, 30) })
        if (draft.primaryText) headlines.push({ text: draft.primaryText.slice(0, 30) })
        while (headlines.length < 3) headlines.push({ text: draft.name.slice(0, 30) })

        const descriptions: Array<{ text: string }> = []
        if (draft.description) descriptions.push({ text: draft.description.slice(0, 90) })
        if (draft.primaryText) descriptions.push({ text: draft.primaryText.slice(0, 90) })
        while (descriptions.length < 2) descriptions.push({ text: draft.name.slice(0, 90) })

        const adRes = await fetch(`${base}/ads:mutate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                operations: [{
                    create: {
                        adGroup: adGroupResourceName,
                        status: 'ENABLED',
                        ad: {
                            responsiveSearchAd: { headlines, descriptions },
                            finalUrls: [draft.destinationUrl || process.env.NEXT_PUBLIC_APP_URL || ''],
                        }
                    }
                }]
            })
        })
        if (!adRes.ok) throw new Error(`Google Ads ad creation failed: ${await adRes.text()}`)
        const adId = (await adRes.json()).results?.[0]?.resourceName?.split('/').pop()

        return {
            providerCampaignId: campaignId || '',
            providerGroupId: adGroupId,
            providerAdId: adId,
        }
    }

    async pauseCampaign(accessToken: string, adAccountId: string, providerCampaignId: string): Promise<boolean> {
        const cid = this.cid(adAccountId)
        const res = await fetch(`${GOOGLE_API_BASE}/customers/${cid}/campaigns:mutate`, {
            method: 'POST',
            headers: this.headers(accessToken, cid),
            body: JSON.stringify({
                operations: [{
                    update: {
                        resourceName: `customers/${cid}/campaigns/${providerCampaignId}`,
                        status: 'PAUSED',
                    },
                    updateMask: 'status',
                }]
            })
        })
        return res.ok
    }

    async resumeCampaign(accessToken: string, adAccountId: string, providerCampaignId: string): Promise<boolean> {
        const cid = this.cid(adAccountId)
        const res = await fetch(`${GOOGLE_API_BASE}/customers/${cid}/campaigns:mutate`, {
            method: 'POST',
            headers: this.headers(accessToken, cid),
            body: JSON.stringify({
                operations: [{
                    update: {
                        resourceName: `customers/${cid}/campaigns/${providerCampaignId}`,
                        status: 'ENABLED',
                    },
                    updateMask: 'status',
                }]
            })
        })
        return res.ok
    }

    async fetchDailyMetrics(accessToken: string, adAccountId: string, from: Date, to: Date): Promise<MetricRow[]> {
        const cid = this.cid(adAccountId)
        const fromStr = from.toISOString().split('T')[0]
        const toStr = to.toISOString().split('T')[0]

        const res = await fetch(`${GOOGLE_API_BASE}/customers/${cid}/googleAds:search`, {
            method: 'POST',
            headers: this.headers(accessToken, cid),
            body: JSON.stringify({
                query: `
                    SELECT campaign.id, segments.date,
                        metrics.cost_micros, metrics.impressions,
                        metrics.clicks, metrics.conversions
                    FROM campaign
                    WHERE segments.date BETWEEN '${fromStr}' AND '${toStr}'
                    AND campaign.status != 'REMOVED'
                `
            })
        })
        if (!res.ok) return []
        const data = await res.json()

        return (data.results || []).map((row: any) => ({
            providerCampaignId: row.campaign?.id?.toString() || '',
            date: new Date(row.segments?.date || fromStr),
            spend: Math.round((parseInt(row.metrics?.costMicros || '0') / 1_000_000) * 100) / 100,
            impressions: parseInt(row.metrics?.impressions || '0'),
            clicks: parseInt(row.metrics?.clicks || '0'),
            conversions: Math.round(parseFloat(row.metrics?.conversions || '0')),
        }))
    }

    async searchLocations(accessToken: string, query: string): Promise<any[]> {
        const res = await fetch(`${GOOGLE_API_BASE}/geoTargetConstants:suggest`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'developer-token': this.developerToken!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locale: 'es', searchTerm: query })
        })
        if (!res.ok) return []
        const data = await res.json()
        return (data.geoTargetConstantSuggestions || []).map((s: any) => ({
            key: s.geoTargetConstant?.resourceName,
            name: s.geoTargetConstant?.name,
            type: s.geoTargetConstant?.targetType,
            countryCode: s.geoTargetConstant?.countryCode,
            countryName: s.geoTargetConstant?.name,
        }))
    }
}
