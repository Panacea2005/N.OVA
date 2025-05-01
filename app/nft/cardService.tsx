export class CardBackgroundService {
    static async generateCardBackground(prompt: string, style: string): Promise<Blob> {
      try {
        console.log('Sending request to server API:', { prompt, style });
  
        const response = await fetch('/api/generate-card-background', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, style }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server API Error Response:', errorData); // Debug log
          throw new Error(errorData.error || 'Failed to generate card background');
        }
  
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
          throw new Error('Received non-image response from API');
        }
  
        return blob;
      } catch (error: any) {
        console.error('Error calling server API:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Authentication error. Please verify your API key and permissions.');
        }
        if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error.message.includes('413')) {
          throw new Error('Request size exceeds 10MiB limit.');
        }
        throw new Error(`Failed to generate card background: ${error.message}`);
      }
    }
  }