# Repo Radar

A private GitHub discovery tracker built with React and Vinext, deployed on Sites.

- Trending: live GitHub Trending selection for daily, weekly and monthly periods. Rank by reported recent star gains, total stars or total forks.
- New repositories: GitHub Search API, top 100 public non-fork, non-archived repositories created since a UTC calendar cutoff, ordered by total stars or forks.
- Language filters, search within fetched results, CSV export, and device-local saved snapshots.
- The server caches each query for five minutes. Refresh rereads the cached query until it expires. GitHub API limits and source failures produce a retryable error, never fabricated results.

Fork counts are lifetime totals. This tracker does not measure fork gains or claim exhaustive worldwide recent-growth rankings. GitHub's trending selection is not a complete list of repositories receiving stars. Saved snapshots stay on the browser device and are not synchronized.

## Development

`npm run dev -- --host 127.0.0.1 --port 5174`

`npx tsc --noEmit`

## Sources

- https://github.com/trending
- https://docs.github.com/en/rest/search/search#search-repositories

WebMCP browsers can call the read-only `get_visible_repositories` tool to read the same filtered list displayed in the UI.
