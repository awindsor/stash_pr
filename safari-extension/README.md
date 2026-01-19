# Stash Safari Extension

A Safari Web Extension version of Stash, the self-hosted read-it-later app. Save articles and highlights directly from Safari to your personal Stash instance.

## Requirements

- Safari 15 or later
- macOS 11 or later
- A deployed Stash web app (e.g., on Vercel)
- A Supabase project with the Stash database schema

## Installation

### 1. Configure the Extension

Edit `config.js` and add your credentials:

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  WEB_APP_URL: 'https://your-stash-app.vercel.app',
  USER_ID: 'YOUR_USER_ID', // Optional - for single-user mode
};
```

Get these values from:
- **SUPABASE_URL** & **SUPABASE_ANON_KEY**: Your Supabase project Settings > API
- **WEB_APP_URL**: Your deployed Stash web app URL
- **USER_ID**: Your user UUID from Supabase Authentication > Users (optional)

### 2. Load into Safari

1. Open Safari and go to **Safari > Settings** (or press Cmd+,)
2. Click the **Extensions** tab
3. Click the **+** button at the bottom-left
4. Navigate to this folder (`safari-extension`) and click **Open**
5. When prompted, click **Allow** to authorize the extension

### 3. Use the Extension

1. Click the Stash icon in Safari's toolbar
2. Sign in with your Supabase credentials (email/password)
3. Click **Save This Page** to save any article
4. View your recent saves in the popup

## Features

- ✅ Save full articles with metadata (title, author, publication date, image)
- ✅ Sign in / Sign up through the extension
- ✅ View recent saves directly in the popup
- ✅ Click to open saved articles in a new tab
- ✅ Fully self-hosted (data stored in your Supabase project)

## Architecture

The extension uses:
- **Manifest V3** (Web Extensions standard - compatible with Safari, Chrome, Firefox)
- **Service Worker** for background tasks
- **Content Script** for article extraction
- **Readability.js** for parsing article content
- **Supabase REST API** for data persistence

## Differences from Chrome Extension

- Uses `browser.*` API instead of `chrome.*` (Web Extensions standard)
- Otherwise functionally identical to the Chrome extension
- Supports the same Supabase backend

## Troubleshooting

**Extension shows "Not authenticated" error:**
- Make sure RLS (Row Level Security) is disabled on your Supabase tables
- Or sign in through the extension popup to get a valid auth token
- See main README for RLS configuration

**Can't see extension in Safari:**
- Ensure you're on Safari 15+
- Try reloading: Safari > Develop > Reload Web Extensions (if available)
- Check Safari > Settings > Extensions to verify it's enabled

**Pages not saving:**
- Check Safari console for errors: Safari > Develop > Show JavaScript Console
- Verify your Supabase credentials in `config.js`
- Ensure the web app URL is accessible

## Contributing

Found a bug? Have a suggestion? Please open an issue or PR!

## License

Same as the main Stash project.
