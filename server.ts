import 'dotenv/config'; // load .env before Prisma or Next.js
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './lib/socket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('[server] Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  initSocketServer(httpServer);

  httpServer
    .once('error', (err) => {
      console.error('[server] Fatal error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`\n🎵 Muzy is running → http://${hostname}:${port}\n`);
    });
});
