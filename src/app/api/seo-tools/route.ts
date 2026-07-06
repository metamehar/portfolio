import { NextRequest, NextResponse } from 'next/server'

// ----------------------------------------------------------------------------
// FAISAL — Free SEO Tools API
//
// Provides 5 free SEO tools that work directly on the website:
// 1. Meta Tag Analyzer — fetches a URL and extracts all meta tags
// 2. Keyword Density Analyzer — analyzes text for keyword frequency
// 3. SEO Score Checker — checks common SEO issues on a URL
// 4. robots.txt Viewer — fetches and displays robots.txt
// 5. PageSpeed Check — redirects to Google PageSpeed Insights
//
// All tools run server-side (no external API keys needed).
// ----------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tool, url, text } = body

    switch (tool) {
      case 'meta-tags': {
        return await analyzeMetaTags(url)
      }
      case 'keyword-density': {
        return analyzeKeywordDensity(text || url)
      }
      case 'seo-score': {
        return await checkSeoScore(url)
      }
      case 'robots-txt': {
        return await fetchRobotsTxt(url)
      }
      default:
        return NextResponse.json({ success: false, error: 'Unknown tool' }, { status: 400 })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/seo-tools] error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

// --- Tool 1: Meta Tag Analyzer ---
async function analyzeMetaTags(url: string) {
  if (!url) return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 })

  try {
    const fetchUrl = url.startsWith('http') ? url : `https://${url}`
    const res = await fetch(fetchUrl, {
      headers: { 'User-Agent': 'FAISAL-SEO-Tools/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    const html = await res.text()

    // Extract meta tags
    const metaTags: any = {}
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is)
    metaTags.title = titleMatch ? titleMatch[1].trim() : 'Not found'

    const descMatch = html.match(/<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']/is)
    metaTags.description = descMatch ? descMatch[1].trim() : 'Not found'

    const keywordsMatch = html.match(/<meta\s+name=["\']keywords["\']\s+content=["\'](.*?)["\']/is)
    metaTags.keywords = keywordsMatch ? keywordsMatch[1].trim() : 'Not found'

    const authorMatch = html.match(/<meta\s+name=["\']author["\']\s+content=["\'](.*?)["\']/is)
    metaTags.author = authorMatch ? authorMatch[1].trim() : 'Not found'

    const viewportMatch = html.match(/<meta\s+name=["\']viewport["\']\s+content=["\'](.*?)["\']/is)
    metaTags.viewport = viewportMatch ? viewportMatch[1].trim() : 'Not found'

    // Open Graph
    const ogTitleMatch = html.match(/<meta\s+property=["\']og:title["\']\s+content=["\'](.*?)["\']/is)
    metaTags.ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : 'Not found'

    const ogDescMatch = html.match(/<meta\s+property=["\']og:description["\']\s+content=["\'](.*?)["\']/is)
    metaTags.ogDescription = ogDescMatch ? ogDescMatch[1].trim() : 'Not found'

    const ogImageMatch = html.match(/<meta\s+property=["\']og:image["\']\s+content=["\'](.*?)["\']/is)
    metaTags.ogImage = ogImageMatch ? ogImageMatch[1].trim() : 'Not found'

    // Twitter Cards
    const twCardMatch = html.match(/<meta\s+name=["\']twitter:card["\']\s+content=["\'](.*?)["\']/is)
    metaTags.twitterCard = twCardMatch ? twCardMatch[1].trim() : 'Not found'

    // Canonical
    const canonicalMatch = html.match(/<link\s+rel=["\']canonical["\']\s+href=["\'](.*?)["\']/is)
    metaTags.canonical = canonicalMatch ? canonicalMatch[1].trim() : 'Not found'

    // H1 count
    const h1Matches = html.match(/<h1[^>]*>/gi)
    metaTags.h1Count = h1Matches ? h1Matches.length : 0

    // H2 count
    const h2Matches = html.match(/<h2[^>]*>/gi)
    metaTags.h2Count = h2Matches ? h2Matches.length : 0

    // Image count
    const imgMatches = html.match(/<img[^>]*>/gi)
    metaTags.imageCount = imgMatches ? imgMatches.length : 0

    // Images without alt
    const imgWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi)
    metaTags.imagesWithoutAlt = imgWithoutAlt ? imgWithoutAlt.length : 0

    // Status code
    metaTags.statusCode = res.status
    metaTags.contentType = res.headers.get('content-type') || 'unknown'

    // Score
    let score = 0
    if (metaTags.title !== 'Not found' && metaTags.title.length > 10 && metaTags.title.length < 60) score += 15
    if (metaTags.description !== 'Not found' && metaTags.description.length > 50 && metaTags.description.length < 160) score += 15
    if (metaTags.keywords !== 'Not found') score += 5
    if (metaTags.ogTitle !== 'Not found') score += 10
    if (metaTags.ogDescription !== 'Not found') score += 10
    if (metaTags.ogImage !== 'Not found') score += 10
    if (metaTags.twitterCard !== 'Not found') score += 10
    if (metaTags.canonical !== 'Not found') score += 10
    if (metaTags.viewport !== 'Not found') score += 10
    if (metaTags.h1Count === 1) score += 5
    if (metaTags.imagesWithoutAlt === 0 && metaTags.imageCount > 0) score += 5
    if (metaTags.imageCount === 0) score += 0

    metaTags.seoScore = Math.min(100, score)

    return NextResponse.json({ success: true, tool: 'meta-tags', url, data: metaTags })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `Could not fetch URL: ${err.message}` })
  }
}

// --- Tool 2: Keyword Density Analyzer ---
function analyzeKeywordDensity(input: string) {
  if (!input) return NextResponse.json({ success: false, error: 'Text or URL is required' })

  const text = input.toLowerCase().replace(/<[^>]*>/g, ' ').replace(/[^a-z0-9\s]/g, ' ')
  const words = text.split(/\s+/).filter(w => w.length > 3)
  const totalWords = words.length

  if (totalWords === 0) {
    return NextResponse.json({ success: false, error: 'No valid words found' })
  }

  // Single word frequency
  const wordCount: Record<string, number> = {}
  words.forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1 })

  // Two-word phrases
  const phraseCount: Record<string, number> = {}
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`
    phraseCount[phrase] = (phraseCount[phrase] || 0) + 1
  }

  // Three-word phrases
  const threeWordCount: Record<string, number> = {}
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
    threeWordCount[phrase] = (threeWordCount[phrase] || 0) + 1
  }

  // Sort and get top results
  const topWords = Object.entries(wordCount)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count, density: ((count / totalWords) * 100).toFixed(2) + '%' }))

  const topPhrases = Object.entries(phraseCount)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, count]) => ({ phrase, count, density: ((count / totalWords) * 100).toFixed(2) + '%' }))

  const topThreeWords = Object.entries(threeWordCount)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase, count]) => ({ phrase, count, density: ((count / totalWords) * 100).toFixed(2) + '%' }))

  return NextResponse.json({
    success: true,
    tool: 'keyword-density',
    data: { totalWords, topWords, topPhrases, topThreeWords },
  })
}

// --- Tool 3: SEO Score Checker ---
async function checkSeoScore(url: string) {
  if (!url) return NextResponse.json({ success: false, error: 'URL is required' })

  try {
    const fetchUrl = url.startsWith('http') ? url : `https://${url}`
    const res = await fetch(fetchUrl, {
      headers: { 'User-Agent': 'FAISAL-SEO-Tools/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    const html = await res.text()

    const checks: any[] = []
    let score = 0
    let maxScore = 0

    // Check 1: Title tag
    maxScore += 10
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is)
    const title = titleMatch ? titleMatch[1].trim() : ''
    if (title.length >= 10 && title.length <= 60) {
      checks.push({ check: 'Title tag (10-60 chars)', status: 'pass', detail: `"${title.substring(0, 50)}..." (${title.length} chars)` })
      score += 10
    } else if (title) {
      checks.push({ check: 'Title tag', status: 'warn', detail: `Title is ${title.length} chars (ideal: 10-60)` })
      score += 5
    } else {
      checks.push({ check: 'Title tag', status: 'fail', detail: 'No title tag found' })
    }

    // Check 2: Meta description
    maxScore += 10
    const descMatch = html.match(/<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']/is)
    const desc = descMatch ? descMatch[1].trim() : ''
    if (desc.length >= 50 && desc.length <= 160) {
      checks.push({ check: 'Meta description (50-160 chars)', status: 'pass', detail: `${desc.length} chars` })
      score += 10
    } else if (desc) {
      checks.push({ check: 'Meta description', status: 'warn', detail: `${desc.length} chars (ideal: 50-160)` })
      score += 5
    } else {
      checks.push({ check: 'Meta description', status: 'fail', detail: 'No description found' })
    }

    // Check 3: H1 tag
    maxScore += 10
    const h1Matches = html.match(/<h1[^>]*>/gi)
    if (h1Matches && h1Matches.length === 1) {
      checks.push({ check: 'Single H1 tag', status: 'pass', detail: '1 H1 found' })
      score += 10
    } else if (h1Matches && h1Matches.length > 1) {
      checks.push({ check: 'H1 tag', status: 'warn', detail: `${h1Matches.length} H1 tags found (should be 1)` })
      score += 3
    } else {
      checks.push({ check: 'H1 tag', status: 'fail', detail: 'No H1 tag found' })
    }

    // Check 4: Viewport meta
    maxScore += 10
    const viewportMatch = html.match(/<meta\s+name=["\']viewport["\']/is)
    if (viewportMatch) {
      checks.push({ check: 'Mobile viewport', status: 'pass', detail: 'Viewport meta tag present' })
      score += 10
    } else {
      checks.push({ check: 'Mobile viewport', status: 'fail', detail: 'No viewport meta (not mobile-friendly)' })
    }

    // Check 5: Canonical URL
    maxScore += 5
    const canonicalMatch = html.match(/<link\s+rel=["\']canonical["\']/is)
    if (canonicalMatch) {
      checks.push({ check: 'Canonical URL', status: 'pass', detail: 'Canonical link present' })
      score += 5
    } else {
      checks.push({ check: 'Canonical URL', status: 'warn', detail: 'No canonical URL' })
    }

    // Check 6: Open Graph tags
    maxScore += 10
    const ogTags = html.match(/<meta\s+property=["\']og:/gi)
    if (ogTags && ogTags.length >= 3) {
      checks.push({ check: 'Open Graph tags', status: 'pass', detail: `${ogTags.length} OG tags found` })
      score += 10
    } else if (ogTags) {
      checks.push({ check: 'Open Graph tags', status: 'warn', detail: `Only ${ogTags.length} OG tags (need 3+)` })
      score += 5
    } else {
      checks.push({ check: 'Open Graph tags', status: 'fail', detail: 'No OG tags found' })
    }

    // Check 7: Images with alt text
    maxScore += 10
    const imgMatches = html.match(/<img[^>]*>/gi) || []
    const imgWithAlt = html.match(/<img[^>]*alt=["\'][^"\']+["\'][^>]*>/gi) || []
    if (imgMatches.length === 0) {
      checks.push({ check: 'Image alt text', status: 'pass', detail: 'No images (N/A)' })
      score += 10
    } else if (imgWithAlt.length === imgMatches.length) {
      checks.push({ check: 'Image alt text', status: 'pass', detail: `All ${imgMatches.length} images have alt text` })
      score += 10
    } else {
      checks.push({ check: 'Image alt text', status: 'fail', detail: `${imgMatches.length - imgWithAlt.length} of ${imgMatches.length} images missing alt` })
    }

    // Check 8: HTTPS
    maxScore += 5
    if (fetchUrl.startsWith('https://')) {
      checks.push({ check: 'HTTPS', status: 'pass', detail: 'Site uses HTTPS' })
      score += 5
    } else {
      checks.push({ check: 'HTTPS', status: 'fail', detail: 'Site does not use HTTPS' })
    }

    // Check 9: Schema markup
    maxScore += 10
    const schemaMatch = html.match(/<script\s+type=["\']application\/ld\+json["\']/is)
    if (schemaMatch) {
      checks.push({ check: 'Schema markup', status: 'pass', detail: 'JSON-LD structured data found' })
      score += 10
    } else {
      checks.push({ check: 'Schema markup', status: 'warn', detail: 'No JSON-LD schema found' })
    }

    // Check 10: robots.txt reference
    maxScore += 5
    const robotsMatch = html.match(/<meta\s+name=["\']robots["\']/is)
    if (robotsMatch) {
      checks.push({ check: 'Robots meta', status: 'pass', detail: 'Robots meta tag present' })
      score += 5
    } else {
      checks.push({ check: 'Robots meta', status: 'warn', detail: 'No robots meta (not critical)' })
      score += 2
    }

    // Check 11: Sitemap reference
    maxScore += 5
    const sitemapMatch = html.match(/<link\s+rel=["\']sitemap["\']/is) || html.match(/sitemap\.xml/i)
    if (sitemapMatch) {
      checks.push({ check: 'Sitemap reference', status: 'pass', detail: 'Sitemap reference found' })
      score += 5
    } else {
      checks.push({ check: 'Sitemap reference', status: 'warn', detail: 'No sitemap reference in HTML' })
    }

    const finalScore = Math.round((score / maxScore) * 100)

    return NextResponse.json({
      success: true,
      tool: 'seo-score',
      url,
      data: { score: finalScore, maxScore, checks, totalChecks: checks.length, passed: checks.filter(c => c.status === 'pass').length, warnings: checks.filter(c => c.status === 'warn').length, failed: checks.filter(c => c.status === 'fail').length },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `Could not fetch URL: ${err.message}` })
  }
}

// --- Tool 4: robots.txt Viewer ---
async function fetchRobotsTxt(url: string) {
  if (!url) return NextResponse.json({ success: false, error: 'URL is required' })

  try {
    const baseUrl = url.startsWith('http') ? url : `https://${url}`
    const robotsUrl = new URL('/robots.txt', baseUrl).href
    const res = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'FAISAL-SEO-Tools/1.0' },
      signal: AbortSignal.timeout(10000),
    })

    if (res.status === 404) {
      return NextResponse.json({ success: true, tool: 'robots-txt', url, data: { found: false, content: 'No robots.txt file found at this URL.' } })
    }

    const content = await res.text()
    return NextResponse.json({ success: true, tool: 'robots-txt', url, data: { found: true, content, size: content.length } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `Could not fetch robots.txt: ${err.message}` })
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'FAISAL Free SEO Tools API',
    tools: [
      { name: 'Meta Tag Analyzer', tool: 'meta-tags', description: 'Extract and analyze all meta tags from any URL' },
      { name: 'Keyword Density Analyzer', tool: 'keyword-density', description: 'Analyze text for keyword frequency and density' },
      { name: 'SEO Score Checker', tool: 'seo-score', description: 'Check 11 common SEO issues and get a score' },
      { name: 'robots.txt Viewer', tool: 'robots-txt', description: 'Fetch and display any website\'s robots.txt' },
      { name: 'PageSpeed Insights', tool: 'pagespeed', description: 'Redirects to Google PageSpeed Insights' },
    ],
  })
}
