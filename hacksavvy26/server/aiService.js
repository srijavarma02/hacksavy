/**
 * aiService.js
 * Featherless.ai integration for AI-powered energy insights and chat.
 * Featherless.ai is OpenAI-compatible, so we use axios with their base URL.
 */

import axios from 'axios';

const FEATHERLESS_BASE_URL = 'https://api.featherless.ai/v1';

// Default to a capable open-weight instruct model; override via FEATHERLESS_MODEL env var
const DEFAULT_MODEL = 'Qwen/Qwen3-30B-A3B-Instruct-2507';

function getModel() {
  return process.env.FEATHERLESS_MODEL || DEFAULT_MODEL;
}

function getApiKey() {
  return process.env.FEATHERLESS_API_KEY;
}

/**
 * Make a chat completion request to featherless.ai.
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} options - max_tokens, temperature, etc.
 * @returns {Promise<string>} The assistant's reply text
 */
async function chatCompletion(messages, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('FEATHERLESS_API_KEY is not set in environment variables.');
  }

  const response = await axios.post(
    `${FEATHERLESS_BASE_URL}/chat/completions`,
    {
      model: getModel(),
      messages,
      max_tokens: options.max_tokens || 600,
      temperature: options.temperature || 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data.choices[0].message.content.trim();
}

/**
 * Generate AI-powered insights for a building's analytics data.
 * Replaces/augments mlService.generateInsights() with real LLM analysis.
 *
 * @param {object} data - Analytics context
 * @param {number} data.wastagePercent - Energy wastage above baseline (%)
 * @param {number} data.powerChange - % change in power vs previous period
 * @param {number} data.peakLoad - Peak load in kW
 * @param {number} data.baseline - Baseline consumption in kW
 * @param {number} data.renewablePercent - Renewable energy usage (%)
 * @param {string} [data.buildingName] - Name of the building
 * @param {Array}  [data.trendData] - Recent trend data points
 * @returns {Promise<Array<{type: string, icon: string, message: string}>>}
 */
async function generateAIInsights(data) {
  const {
    wastagePercent,
    powerChange,
    peakLoad,
    baseline,
    renewablePercent,
    buildingName,
    trendData,
  } = data;

  const contextSummary = `
Building: ${buildingName || 'Campus (All Buildings)'}
Energy wastage above baseline: ${wastagePercent?.toFixed(1)}%
Power change vs previous period: ${powerChange?.toFixed(1)}%
Peak load: ${peakLoad} kW
Baseline consumption: ${baseline} kW
Renewable energy usage: ${renewablePercent?.toFixed(1)}%
${trendData ? `Recent trend (last 5 readings in kWh): ${trendData.slice(-5).map(d => d.consumption?.toFixed(0)).join(', ')}` : ''}
  `.trim();

  const systemPrompt = `You are an expert energy management AI for a smart university campus. 
Your role is to analyze real-time energy consumption data and provide concise, actionable insights.
Focus on practical recommendations that facility managers can act on immediately.
Keep each insight to 1-2 sentences. Be specific with numbers when available.`;

  const userPrompt = `Analyze the following campus energy data and provide exactly 4 insights as a JSON array.
Each insight must have: "type" (one of: critical, warning, success, info), "icon" (relevant emoji), "message" (the insight text).

Energy Data:
${contextSummary}

Return ONLY a valid JSON array, no markdown, no explanation. Example format:
[{"type":"warning","icon":"⚠️","message":"Your insight here."}]`;

  try {
    const reply = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { max_tokens: 700, temperature: 0.5 }
    );

    // Parse the JSON array from the response
    const jsonMatch = reply.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      return Array.isArray(insights) ? insights : fallbackInsights(data);
    }

    return fallbackInsights(data);
  } catch (err) {
    console.error('[aiService] generateAIInsights error:', err.message);
    return fallbackInsights(data);
  }
}

/**
 * Answer a natural language question about campus energy data.
 * Used by the /api/ai/chat endpoint.
 *
 * @param {string} userQuestion - The user's question
 * @param {object} campusContext - Current live campus data snapshot
 * @param {Array}  conversationHistory - Prior messages [{role, content}]
 * @returns {Promise<string>} AI response text
 */
async function answerEnergyQuestion(userQuestion, campusContext, conversationHistory = []) {
  const systemPrompt = `You are EcoPulse AI, an intelligent energy management assistant for a smart university campus.
You have access to real-time energy, water, gas, and sustainability data for 7 campus buildings:
Engineering, Science Lab, Library, Dorm A, Dorm B, Sports Center, and Admin.

Current Campus Snapshot:
${JSON.stringify(campusContext, null, 2)}

Guidelines:
- Answer questions about energy consumption, anomalies, cost savings, and sustainability
- Provide specific, actionable recommendations
- Use the data provided to support your answers
- Keep responses concise (2-4 sentences unless more detail is requested)
- Use kW for power and kWh for energy in your responses`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-8), // Keep last 8 messages for context
    { role: 'user', content: userQuestion },
  ];

  return await chatCompletion(messages, { max_tokens: 500, temperature: 0.7 });
}

/**
 * Fallback to rule-based insights when AI is unavailable (no API key, network error, etc.)
 */
function fallbackInsights(data) {
  const { wastagePercent, powerChange, peakLoad, baseline, renewablePercent } = data;
  const insights = [];

  if (wastagePercent > 20) {
    insights.push({
      type: 'critical',
      icon: '🚨',
      message: `High wastage detected: ${wastagePercent?.toFixed(1)}% over baseline. Immediate action required.`,
    });
  }
  if (powerChange < -5) {
    insights.push({
      type: 'success',
      icon: '✅',
      message: `Power consumption decreased by ${Math.abs(powerChange)?.toFixed(1)}%. Great progress!`,
    });
  }
  if (peakLoad > baseline * 1.5) {
    insights.push({
      type: 'warning',
      icon: '⚠️',
      message: 'Peak load exceeds optimal range. Consider load balancing strategies.',
    });
  }
  if (renewablePercent < 30) {
    insights.push({
      type: 'info',
      icon: 'ℹ️',
      message: 'Renewable energy usage below target. Explore solar/wind options.',
    });
  }

  // Ensure at least one insight is returned
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      icon: '📊',
      message: 'Energy consumption is within normal parameters. Continue monitoring for optimization opportunities.',
    });
  }

  return insights;
}

export default {
  generateAIInsights,
  answerEnergyQuestion,
  chatCompletion,
};
