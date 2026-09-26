require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const { verifyMetaSignature } = require('./verifySignature');
const { fetchLeadDetails } = require('./metaGraph');

const app = express();
const PORT = process.env.PORT || 4000;
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

const leadsStore = [];

io.on('connection', (socket) => {
  socket.emit('leads:init', leadsStore);

  socket.on('disconnect', () => {});
});

app.get('/health', (req, res) => {
  res.json({ message: 'Server running' });
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post('/webhook', verifyMetaSignature(process.env.META_APP_SECRET), async (req, res) => {
  res.sendStatus(200);

  try {
    const body = req.body;

    if (body.object !== 'page') return;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {

        if (change.field !== 'leadgen') continue;

        const leadgenId = change.value.leadgen_id;

        const lead = await fetchLeadDetails(
          leadgenId,
          process.env.META_PAGE_ACCESS_TOKEN
        );

        leadsStore.unshift(lead);

        io.emit('leads:new', lead);
      }
    }
  } catch (err) {}
});

app.get('/leads', (req, res) => {
  res.json(leadsStore);
});

server.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});