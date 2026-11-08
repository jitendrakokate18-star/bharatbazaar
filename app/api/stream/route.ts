import { NextRequest } from 'next/server';
import { defaultDataProvider } from '@/lib/providers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isinsParam = searchParams.get('isins') || '';
  const isins = isinsParam.split(',').filter(Boolean);

  const encoder = new TextEncoder();
  const lastTimestamps = new Map<string, string>();

  const stream = new ReadableStream({
    async start(controller) {
      const sendPrices = async (forcePush = false) => {
        try {
          const updates = await Promise.all(
            isins.map(async (isin) => {
              return await defaultDataProvider.getLivePrice(isin);
            })
          );

          // Check if any quote has a newer timestamp or if forcePush is requested
          let hasNewTick = forcePush;
          for (const item of updates) {
            const prev = lastTimestamps.get(item.isin);
            if (prev !== item.lastUpdated) {
              hasNewTick = true;
              lastTimestamps.set(item.isin, item.lastUpdated);
            }
          }

          if (hasNewTick) {
            const message = `data: ${JSON.stringify(updates)}\n\n`;
            controller.enqueue(encoder.encode(message));
          }
        } catch (err) {
          // Stream error handling
        }
      };

      // Send initial tick immediately
      await sendPrices(true);

      // Periodic check every 5 seconds for cache/DB changes
      const interval = setInterval(async () => {
        await sendPrices(false);
      }, 5000);

      // Clean up on client abort
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch (_) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
