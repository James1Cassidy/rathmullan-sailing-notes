# Google AdSense Setup Instructions

## Step 1: Get Your Publisher ID

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up or log in
3. Find your publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXXX`)

## Step 2: Replace Placeholders

Search and replace these placeholders in all HTML files:

- `ca-pub-XXXXXXXXXXXXXXXXX` → Your actual publisher ID
- `YYYYYYYYYY` → Ad slot ID for top banner (you'll get this from AdSense)
- `ZZZZZZZZZZ` → Ad slot ID for bottom banner (you'll get this from AdSense)

## Step 3: Get Ad Slot IDs

1. In AdSense dashboard, go to **Ads** → **By ad unit**
2. Click **+ New ad unit**
3. Choose **Display ads**
4. Name it (e.g., "Top Banner", "Bottom Banner", "Sidebar")
5. Choose **Responsive** size
6. Click **Create**
7. Copy the `data-ad-slot` value

## Ad Placements

AdSense has been added to these pages:
- ✅ index.html (homepage)
- ✅ basic_skills.html
- ✅ start_sailing.html
- ✅ taste_of_sailing.html
- ✅ improving_skills.html
- ✅ advanced.html

Each page has:
- **Top banner** - After header, before main content
- **Bottom banner** - Before footer

## Notes

- Ads won't show until you:
  1. Replace placeholders with real IDs
  2. Get approved by Google AdSense
  3. Deploy to your live site
- Google needs to crawl your site after deployment
- It may take 24-48 hours for ads to appear
- Test pages won't show real ads (you'll see blank spaces)

## Testing

To verify ads are properly set up:
1. View page source
2. Look for `googlesyndication.com` scripts
3. Check browser console for AdSense errors
4. Use Chrome extension "Google Publisher Tag Inspector"
