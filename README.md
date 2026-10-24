# Joshua Adoghe — portfolio site

Static site, deployed two ways from this one repo:

| Folder  | Served by    | URL                                  |
|---------|--------------|--------------------------------------|
| `dist/` | Netlify      | https://joshuaadoghe.netlify.app     |
| `docs/` | GitHub Pages | https://1billionco.github.io         |

`dist/` is the only copy you edit. `docs/` is generated from it.

## Making a change

1. **Edit** the page in `dist/` (e.g. `dist/about/index.html`, `dist/styles.css`).
2. **Rebuild** the GitHub Pages copy:
   ```
   python3 sync_mirror.py
   ```
3. **Commit**:
   ```
   git add -A
   git commit -m "Describe the change"
   ```
4. **Push**:
   ```
   git push
   ```
   Netlify and GitHub Pages both redeploy automatically.

## What differs between the two builds

`sync_mirror.py` keeps these differences:

- `docs/` has no `sitemap.xml`, and its `robots.txt` has no Sitemap line.
- The contact form in `docs/` posts to the Netlify site, so every brief lands in Netlify Forms.
- `docs/.nojekyll` makes GitHub serve the files as they are.

Canonical URLs point at https://joshuaadoghe.netlify.app in both builds.

## Other files

- `netlify.toml`: Netlify settings (publish `dist`, security headers, old-URL redirects).
- `dist/site.js`: the animation layer. It has no dependencies or tracking, and it switches off for visitors who prefer reduced motion.
