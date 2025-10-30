/**
 * Beehiv API Client
 *
 * Integration with Beehiv newsletter platform for:
 * - Managing publications and subscribers
 * - Sending campaign updates
 * - Tracking newsletter analytics
 * - Distributing AI-generated creative content
 */

const BEEHIV_API_BASE = 'https://api.beehiiv.com/v2';

export interface BeehivSubscriber {
  email: string;
  status?: 'active' | 'inactive';
  custom_fields?: Record<string, any>;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  referring_site?: string;
  double_opt_override?: boolean;
}

export interface BeehivPost {
  title: string;
  content_html: string;
  content_tags?: string[];
  status?: 'draft' | 'confirmed';
  audience?: 'free' | 'premium' | 'all';
  platform?: 'both' | 'web' | 'email';
  thumbnail_url?: string;
}

export interface BeehivPublication {
  id: string;
  name: string;
  subdomain: string;
  custom_domain?: string;
  created_at: string;
}

export interface BeehivWebhookPayload {
  data: {
    email: string;
    publication_id: string;
    status: string;
    created: number;
  };
}

export class BeehivClient {
  private apiKey: string;
  private publicationId: string;

  constructor(apiKey?: string, publicationId?: string) {
    this.apiKey = apiKey || process.env.BEEHIV_API_KEY || '';
    this.publicationId = publicationId || process.env.BEEHIV_PUBLICATION_ID || '';

    if (!this.apiKey) {
      throw new Error('BEEHIV_API_KEY is required');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BEEHIV_API_BASE}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Beehiv API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Subscribe a user to the newsletter
   */
  async subscribe(subscriber: BeehivSubscriber): Promise<any> {
    return this.request(`/publications/${this.publicationId}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify(subscriber),
    });
  }

  /**
   * Get subscriber by email
   */
  async getSubscriber(email: string): Promise<any> {
    return this.request(
      `/publications/${this.publicationId}/subscriptions/${encodeURIComponent(email)}`
    );
  }

  /**
   * Update subscriber status
   */
  async updateSubscriber(
    email: string,
    updates: Partial<BeehivSubscriber>
  ): Promise<any> {
    return this.request(
      `/publications/${this.publicationId}/subscriptions/${encodeURIComponent(email)}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  }

  /**
   * Unsubscribe a user
   */
  async unsubscribe(email: string): Promise<any> {
    return this.request(
      `/publications/${this.publicationId}/subscriptions/${encodeURIComponent(email)}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Create a post (draft or published)
   */
  async createPost(post: BeehivPost): Promise<any> {
    return this.request(`/publications/${this.publicationId}/posts`, {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  /**
   * Get publication details
   */
  async getPublication(): Promise<BeehivPublication> {
    return this.request(`/publications/${this.publicationId}`);
  }

  /**
   * Get publication stats
   */
  async getStats(): Promise<any> {
    return this.request(`/publications/${this.publicationId}/stats`);
  }

  /**
   * Send a campaign update with AI-generated content
   * Integrates with the Beehive platform's creative generation
   */
  async sendCampaignUpdate(params: {
    title: string;
    content: string;
    sentiment?: string;
    campaignId?: string;
    tags?: string[];
  }): Promise<any> {
    const { title, content, sentiment, campaignId, tags = [] } = params;

    const post: BeehivPost = {
      title,
      content_html: content,
      content_tags: [
        ...tags,
        sentiment ? `sentiment:${sentiment}` : '',
        campaignId ? `campaign:${campaignId}` : '',
      ].filter(Boolean),
      status: 'confirmed',
      audience: 'all',
      platform: 'both',
    };

    return this.createPost(post);
  }

  /**
   * Verify webhook signature (if Beehiv provides HMAC signatures)
   */
  static verifyWebhook(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Implement HMAC verification if Beehiv provides webhook signatures
    // This is a placeholder - adjust based on actual Beehiv webhook security
    return true;
  }
}

// Singleton instance for server-side use
let beehivClient: BeehivClient | null = null;

export function getBeehivClient(): BeehivClient {
  if (!beehivClient) {
    beehivClient = new BeehivClient();
  }
  return beehivClient;
}

// Export convenience functions
export async function subscribeToNewsletter(
  email: string,
  metadata?: Record<string, any>
): Promise<any> {
  const client = getBeehivClient();
  return client.subscribe({
    email,
    status: 'active',
    custom_fields: metadata,
  });
}

export async function sendNewsletterCampaign(params: {
  title: string;
  content: string;
  sentiment?: string;
  campaignId?: string;
}): Promise<any> {
  const client = getBeehivClient();
  return client.sendCampaignUpdate(params);
}
