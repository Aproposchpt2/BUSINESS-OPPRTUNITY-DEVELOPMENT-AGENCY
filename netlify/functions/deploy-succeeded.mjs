// Netlify runs this automatically after every successful deploy.
// On production deploys it tells IndexNow (Bing, Yandex, Seznam, Naver)
// that every page in the sitemap may have changed, so they recrawl quickly.

const HOST = "sbda.stellaruc.com";
const KEY = "94935a6c856cf1ebbcc02f221cb7b673";
const SITEMAP = `https://${HOST}/sitemap.xml`;

export const handler = async (event) => {
  let context = "";
  try {
    context = JSON.parse(event.body || "{}")?.payload?.context || "";
  } catch {
    // Ignore malformed payloads and treat them as non-production.
  }
  if (context !== "production") {
    return { statusCode: 200, body: `Skipped IndexNow for ${context || "unknown"} deploy` };
  }

  try {
    const xml = await (await fetch(SITEMAP)).text();
    const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => m[1].trim())
      .filter((u) => new URL(u).host === HOST);
    if (!urlList.length) return { statusCode: 200, body: "No sitemap URLs found" };

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList,
      }),
    });
    console.log(`IndexNow: ${res.status} for ${urlList.length} URLs`);
    return { statusCode: 200, body: `IndexNow ${res.status}` };
  } catch (err) {
    console.error("IndexNow ping failed:", err);
    return { statusCode: 200, body: "IndexNow ping failed" };
  }
};
