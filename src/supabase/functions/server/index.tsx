import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS and logging
app.use('*', cors());
app.use('*', logger(console.log));

// Get current photo counter
app.get('/make-server-47e2c83e/counter', async (c) => {
  try {
    const counter = await kv.get('halloween-photobooth-counter');
    return c.json({ count: counter || 0 });
  } catch (error) {
    console.log(`Error fetching counter: ${error}`);
    return c.json({ error: 'Failed to fetch counter', details: error.message }, 500);
  }
});

// Increment photo counter
app.post('/make-server-47e2c83e/counter/increment', async (c) => {
  try {
    const currentCounter = await kv.get('halloween-photobooth-counter');
    const newCounter = (currentCounter || 0) + 1;
    await kv.set('halloween-photobooth-counter', newCounter);
    return c.json({ count: newCounter });
  } catch (error) {
    console.log(`Error incrementing counter: ${error}`);
    return c.json({ error: 'Failed to increment counter', details: error.message }, 500);
  }
});

Deno.serve(app.fetch);
