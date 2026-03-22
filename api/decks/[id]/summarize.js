import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

/**
 * Vercel Serverless Function: POST /api/decks/:id/summarize
 *
 * Generates an AI summary of a story deck using Claude
 */

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Category labels for display
const CATEGORY_LABELS = {
  plot: 'Plot',
  character: 'Character',
  world: 'World Building',
  theme: 'Theme',
  twist: 'Twist',
  scene: 'Scene',
};

/**
 * Format cards into a prompt string
 */
function formatCardsForPrompt(cards) {
  return cards
    .sort((a, b) => a.position - b.position)
    .map((card) => {
      const categoryLabel = CATEGORY_LABELS[card.category] || card.category;
      const characters = card.characters?.length > 0
        ? ` [Characters: ${card.characters.join(', ')}]`
        : '';
      return `[Card ${card.position}] [${categoryLabel}] "${card.title}"${characters}: ${card.body || '(no description)'}`;
    })
    .join('\n\n');
}

/**
 * System prompt for Claude
 */
const SYSTEM_PROMPT = `You are a skilled story editor helping writers understand and refine their narratives.
You will be given a set of story cards that represent beats, characters, themes, and scenes in a story.
Your task is to provide a concise, insightful summary that:
1. Captures the core narrative arc
2. Highlights the main characters and their journey
3. Notes key themes or motifs
4. Identifies the story's emotional core

Be constructive and encouraging while being honest about the story's structure.
Keep your response to 3-5 sentences maximum.`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get deck ID from URL
  const { id: deckId } = req.query;

  if (!deckId) {
    return res.status(400).json({ error: 'Deck ID is required' });
  }

  // Check for required environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    // Fetch deck to verify it exists
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('id, title')
      .eq('id', deckId)
      .single();

    if (deckError || !deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    // Fetch all cards for the deck, sorted by position
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deckId)
      .order('position', { ascending: true });

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return res.status(500).json({ error: 'Failed to fetch cards' });
    }

    if (!cards || cards.length === 0) {
      return res.status(400).json({ error: 'No cards in deck to summarize' });
    }

    // Format cards for the prompt
    const cardsPrompt = formatCardsForPrompt(cards);

    // Create user prompt
    const userPrompt = `Here are the story cards for "${deck.title}":\n\n${cardsPrompt}\n\nPlease provide a concise summary of this story.`;

    // Call Anthropic API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract the text response
    const summary = message.content[0]?.text || 'Unable to generate summary.';

    // Return the summary
    return res.status(200).json({
      summary,
      deckId,
      cardCount: cards.length,
    });
  } catch (error) {
    console.error('Summarize error:', error);

    // Handle specific Anthropic errors
    if (error.status === 401) {
      return res.status(500).json({ error: 'Invalid API key' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
