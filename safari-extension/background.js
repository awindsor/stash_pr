importScripts('config.js', 'supabase.js');

let supabase = null;

browser.runtime.onInstalled.addListener(() => {
  initSupabase();
});

async function initSupabase() {
  supabase = new SupabaseClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  await supabase.init();
}

async function savePage(tab) {
  try {
    const stored = await browser.storage.local.get(['stash_session']);
    if (!stored.stash_session) {
      throw new Error('Not authenticated. Sign in through the extension popup.');
    }

    supabase.accessToken = stored.stash_session.access_token;
    
    let article;
    try {
      article = await browser.tabs.sendMessage(tab.id, { action: 'extractArticle' });
    } catch (e) {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['Readability.js', 'content.js']
      });
      await new Promise(r => setTimeout(r, 100));
      article = await browser.tabs.sendMessage(tab.id, { action: 'extractArticle' });
    }

    if (!article) {
      throw new Error('Failed to extract article');
    }

    const result = await supabase.insert('saves', {
      user_id: CONFIG.USER_ID,
      url: tab.url,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      site_name: article.siteName,
      author: article.author,
      published_at: article.publishedTime,
      image_url: article.imageUrl,
      source: 'extension',
    });

    browser.tabs.sendMessage(tab.id, {
      action: 'showToast',
      message: 'Page saved!',
    }).catch(() => {});
  } catch (err) {
    console.error('Save failed:', err);
  }
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'savePage') {
    browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        try {
          await savePage(tabs[0]);
          sendResponse({ success: true });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      }
    });
    return true;
  }

  if (request.action === 'signIn') {
    (async () => {
      if (!supabase) await initSupabase();
      try {
        const session = await supabase.signIn(request.email, request.password);
        sendResponse({ success: true, session });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (request.action === 'signUp') {
    (async () => {
      if (!supabase) await initSupabase();
      try {
        await supabase.signUp(request.email, request.password);
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (request.action === 'signOut') {
    (async () => {
      if (!supabase) await initSupabase();
      await supabase.signOut();
      sendResponse({ success: true });
    })();
    return true;
  }

  if (request.action === 'getRecentSaves') {
    (async () => {
      if (!supabase) await initSupabase();
      try {
        const stored = await browser.storage.local.get(['stash_session']);
        if (stored.stash_session) {
          supabase.accessToken = stored.stash_session.access_token;
        }
        const saves = await supabase.select('saves', {
          order: 'created_at.desc',
          limit: 10,
        });
        sendResponse({ success: true, saves });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});
