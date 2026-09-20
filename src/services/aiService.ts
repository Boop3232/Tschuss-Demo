import { ChatMessage, ChatApiResponse } from '../types';

interface ChatContext {
  currentPath?: string;
  userRole?: string;
  location?: string;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  context: ChatContext = {}
): Promise<ChatApiResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        currentPath: context.currentPath || window.location.pathname,
        userRole: context.userRole || 'consumer',
        location: context.location || 'Munich',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    const data: ChatApiResponse = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Chat request fallback invoked:', err?.message || err);

    // Context-aware intelligent fallback response
    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    let fallbackText = "Hello! I'm **Tschüss AI**. How can I help you save food and margin today?\n\n";

    if (lastMsg.includes('reserve') || lastMsg.includes('how') || lastMsg.includes('order')) {
      fallbackText += "### Reserving Surplus Deals\n- Browse available listings on [Discover Food Deals](/app/discover)\n- Click any item to see expiration countdowns & store distance\n- Confirm your reservation with 1-click & pick it up at the store with your pickup code in [My Reservations](/app/reservations)!";
    } else if (lastMsg.includes('business') || lastMsg.includes('partner') || lastMsg.includes('store') || lastMsg.includes('retailer')) {
      fallbackText += "### Retailer & Store Partner Options\n- Learn about our zero-commission partner program on [For Business](/for-business)\n- Ready to list surplus bakery, dairy, or produce? Access the [Retailer Dashboard](/business) to publish offers in under 60 seconds!";
    } else if (lastMsg.includes('map') || lastMsg.includes('store') || lastMsg.includes('near')) {
      fallbackText += "### Locate Stores Near You\n- Check live neighborhood stores, radius distances, and stock on the [Store Map](/app/map).";
    } else if (lastMsg.includes('impact') || lastMsg.includes('co2') || lastMsg.includes('carbon')) {
      fallbackText += "### Track Your Ecological Impact\n- View your total kg of food diverted from landfills and CO₂e emissions prevented on [My Impact](/app/impact).";
    } else {
      fallbackText += "Here are the most popular destinations on Tschüss:\n- 🥐 [Discover Food Deals](/app/discover)\n- 📍 [Interactive Store Map](/app/map)\n- 🏪 [Partner with Us as a Retailer](/for-business)\n- 📖 [How Food Rescue Works](/how-it-works)";
    }

    return {
      reply: fallbackText,
      suggestedActions: [
        { label: 'Discover Deals', path: '/app/discover' },
        { label: 'Store Map', path: '/app/map' },
        { label: 'How It Works', path: '/how-it-works' },
        { label: 'For Business', path: '/for-business' },
      ],
    };
  }
}
