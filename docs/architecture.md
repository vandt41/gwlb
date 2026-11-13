# Architecture and trust boundaries

The React frontend is static and deployed to GitHub Pages. It fetches public JSON files at runtime. There is no API, login, database or browser write path in the MVP.

The C++ tactical engine is a separate local CLI program. It reads manager-only JSON and calculates position suitability. The manager chooses what to publish by updating the public match JSON.

A public repository exposes all committed files and Git history. The frontend must never request private data. Do not commit private player ratings, credentials, contact details or other non-public information.

If the team later needs attendance self-confirmation, shared private data, edits from phones or live updates, add a hosted backend and database. Keep the tactical engine independent so it can be reused.
