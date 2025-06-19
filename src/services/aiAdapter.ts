interface AIGenerateRequest {
  provider: 'mistral' | 'gemini';
  type: 'text' | 'image';
  prompt: string;
  params?: Record<string, any>;
}

interface AIResponse {
  success: boolean;
  content?: string;
  imageUrl?: string;
  error?: string;
}

export class AIServiceAdapter {
  private mistralApiKey: string;
  private geminiApiKey: string;
  private mistralApiBaseUrl: string;

  constructor() {
    this.mistralApiKey = process.env.MISTRAL_API_KEY || 'MOCK_MISTRAL_API_KEY';
    this.geminiApiKey = process.env.GEMINI_API_KEY || 'MOCK_GEMINI_API_KEY';
    this.mistralApiBaseUrl = process.env.MISTRAL_API_BASE_URL || 'https://api.mistral.ai/v1';
  }

  async generate(request: AIGenerateRequest): Promise<AIResponse> {
    console.log(`AI Service Adapter: Generating ${request.type} content from ${request.provider} with prompt: ${request.prompt}`);

    if (request.provider === 'mistral' && request.type === 'text') {
      try {
        const response = await fetch(`${this.mistralApiBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.mistralApiKey}`,
          },
          body: JSON.stringify({
            model: 'mistral-tiny', // Or another appropriate Mistral model
            messages: [{ role: 'user', content: request.prompt }],
            ...request.params,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Mistral API Error:', errorData);
          return { success: false, error: `Mistral API error: ${errorData.message || response.statusText}` };
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (content) {
          return { success: true, content };
        } else {
          return { success: false, error: 'No content received from Mistral AI.' };
        }
      } catch (error: any) {
        console.error('Error calling Mistral API:', error);
        return { success: false, error: `Error calling Mistral API: ${error.message}` };
      }
    } else if (request.provider === 'gemini' && request.type === 'image') {
      // Simulate Gemini API call (no changes needed for this part for now)
      return { success: true, imageUrl: `https://example.com/generated-image-${Date.now()}.png` };
    } else {
      return { success: false, error: 'Unsupported AI provider or type combination.' };
    }
  }
}