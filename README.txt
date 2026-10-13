OCEAN GUARDIAN — FIREBASE CODES

The existing index.html and style.css are included unchanged, so the dashboard design should stay the same. script.js contains the dashboard behavior and Firebase Cloud Firestore connection.

SETUP
1. Extract all files into one folder. Keep index.html, style.css, and script.js together.
2. In Firebase Console, open your project: ocean-guardian-3c430.
3. Go to Build > Authentication > Sign-in method and enable Anonymous.
4. Go to Build > Firestore Database > Rules.
5. Copy the contents of firestore.rules.txt into the Rules editor and click Publish.
6. Upload/replace the three site files in your GitHub repository. Do not rename them.
7. Open your GitHub Pages site, refresh it, and look for the Cloud Database section near the bottom.
8. Try an image scan or a cleanup action, then press Refresh records. The record should appear if Firebase is configured correctly.

IMPORTANT
- This is a student prototype. The dashboard's AI scan is simulated/random in the current JavaScript; it does not genuinely recognize the contents of an image.
- These Firestore rules are suitable only for a demo. Anonymous users can read records and create scan/cleanup entries. Do not store personal or sensitive information. For a public production app, use stronger authentication and stricter per-user rules.
- Keep the Firebase web config in the client code only; never add a Firebase service-account/private key to the website.
