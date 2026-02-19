const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'luxury-admin-123';

let products = [
  {
    id: 1,
    name: 'AirPulse Headphones',
    desc: 'Wireless over-ear comfort with deep bass.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'ZenLamp Mini',
    desc: 'Soft ambient light perfect for desks and nightstands.',
    price: 34.5,
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'FitTrack Pro Band',
    desc: 'Heart-rate, sleep and activity tracking made easy.',
    price: 59,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'CarryMate Backpack',
    desc: 'Lightweight, water-resistant, and commuter-friendly.',
    price: 74,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
  }
];

function sendJson(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function getContentType(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function isAuthorized(req) {
  return req.headers['x-admin-token'] === ADMIN_TOKEN;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function validateProduct(body) {
  const { name, desc, price, image } = body;
  if (!name || !desc || !image || Number.isNaN(Number(price))) {
    return 'name, desc, image and numeric price are required';
  }
  return null;
}

function serveFile(req, res, urlPath) {
  const safePath = path.normalize(urlPath).replace(/^\/+/, '');
  const resolved = safePath === '' ? 'index.html' : safePath;
  const fullPath = path.join(process.cwd(), resolved);

  if (!fullPath.startsWith(process.cwd())) {
    sendJson(res, 403, { message: 'Forbidden' });
    return;
  }

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      sendJson(res, 404, { message: 'Not found' });
      return;
    }
    res.writeHead(200, { 'Content-Type': getContentType(fullPath) });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/products' && req.method === 'GET') {
    sendJson(res, 200, products);
    return;
  }

  if (url.pathname === '/api/admin/products' && req.method === 'GET') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { message: 'Unauthorized' });
      return;
    }
    sendJson(res, 200, products);
    return;
  }

  if (url.pathname === '/api/admin/products' && req.method === 'POST') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { message: 'Unauthorized' });
      return;
    }

    try {
      const body = await parseBody(req);
      const error = validateProduct(body);
      if (error) {
        sendJson(res, 400, { message: error });
        return;
      }

      const newProduct = {
        id: Date.now(),
        name: body.name,
        desc: body.desc,
        image: body.image,
        price: Number(body.price)
      };
      products = [newProduct, ...products];
      sendJson(res, 201, newProduct);
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (url.pathname.startsWith('/api/admin/products/') && req.method === 'DELETE') {
    if (!isAuthorized(req)) {
      sendJson(res, 401, { message: 'Unauthorized' });
      return;
    }

    const id = Number(url.pathname.split('/').pop());
    const before = products.length;
    products = products.filter((item) => item.id !== id);

    if (before === products.length) {
      sendJson(res, 404, { message: 'Product not found' });
      return;
    }

    sendJson(res, 200, { message: 'Product deleted' });
    return;
  }

  if (url.pathname === '/admin') {
    serveFile(req, res, 'admin.html');
    return;
  }

  serveFile(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`NovaCart server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`Admin token header x-admin-token=${ADMIN_TOKEN}`);
});
