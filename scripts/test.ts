// removed

async function run() {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) throw new Error("PAGESPEED_API_KEY is not set (add it to .env.local)");
  const url = 'https://trustbugsy.com/';
  const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&category=accessibility&category=seo&strategy=mobile`;

  const res = await fetch(apiEndpoint);
  const data = await res.json();
  const lighthouse = data.lighthouseResult;
  console.log('Available audits:', Object.keys(lighthouse?.audits || {}).filter(k => k.includes('view') || k.includes('mobile')));
}

run();
