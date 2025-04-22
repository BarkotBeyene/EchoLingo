// openai.js
import { OPENAI_API_KEY } from '@env';

console.log("OPENAI_API_KEY:", OPENAI_API_KEY);

export async function sendMessageToAI(prompt) {
  if (!navigator?.onLine) {
    console.warn("Device is offline");
    return "You appear to be offline. Please check your internet connection and try again.";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15-second timeout

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout); // Stop timeout if fetch succeeded

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      return `OpenAI request failed with status ${response.status}`;
    }

    const json = await response.json();
    return json.choices?.[0]?.message?.content?.trim();
  } catch (error) {
    console.error("sendMessageToAI error:", error.message || error);
    return "Sorry, your AI request could not be completed. Please try again.";
  }
}