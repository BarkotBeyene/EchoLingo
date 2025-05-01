// openai.js
import { OPENAI_API_KEY } from '@env';

export async function sendMessageToAI(prompt) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 50) {
    console.error("Invalid OpenAI API key");
    return "OpenAI API key is invalid or missing. Please check your environment setup.";
  }

  if (!navigator?.onLine) {
    console.warn("Device is offline");
    return "You appear to be offline. Please check your internet connection and try again.";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15-second timeout

  try {
    const apiKey = OPENAI_API_KEY.trim();
    if (apiKey.startsWith('sk-')) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': '*'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout); // Stop timeout if fetch succeeded

      if (response.status === 401) {
        console.error('OpenAI API Authentication failed');
        return "Authentication failed. Please check if your API key is valid and has sufficient permissions.";
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return `API request failed: ${errorData.error?.message || response.statusText}`;
      }

      const json = await response.json();
      return json.choices?.[0]?.message?.content?.trim();
    } else {
      console.error('Invalid API key format');
      return "Invalid API key format. API key should start with 'sk-'";
    }
  } catch (error) {
    console.error("sendMessageToAI error:", error.message || error);
    return "Sorry, your AI request could not be completed. Please try again.";
  }
}