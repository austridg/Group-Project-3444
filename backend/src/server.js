/**
 * last updated: 2026-07-04
 * update author: Austin
 */

'use strict';

/*
 * entry point: start the http server
 *   npm start -> node src/server.js
 *   npm run dev -> node --watch src/server.js  (restarts on file save)
 */

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Centsible API listening on http://localhost:${PORT}`);
});