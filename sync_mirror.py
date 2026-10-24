"""Copy the Netlify build (dist/) to the GitHub Pages build (docs/).

dist/ is the only copy you edit. Run this after every change:

    python3 sync_mirror.py

docs/ is regenerated from scratch each time, with these differences kept:
  - no sitemap.xml (the sitemap lives on Netlify only)
  - robots.txt has no Sitemap line
  - the contact form posts to the Netlify site, so briefs sent from
    GitHub Pages still arrive in Netlify Forms
  - site-root links (href="/...", src="/...") get the /joshua-adoghe/
    prefix, because GitHub serves this repo as a project site at
    https://1billionco.github.io/joshua-adoghe/
  - a .nojekyll file so GitHub serves the files as they are
Canonical tags stay pointed at https://joshuaadoghe.netlify.app in both.
"""
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "dist"
DST = ROOT / "docs"
NETLIFY = "https://joshuaadoghe.netlify.app"
BASE = "/joshua-adoghe/"
SKIP = {"sitemap.xml", "netlify.toml", ".DS_Store"}

FORM_LOCAL = 'action="/thanks/" data-netlify="true"'
FORM_REMOTE = f'action="{NETLIFY}/thanks/" data-netlify="true"'
ROOT_LINK = re.compile(r'((?:href|src|action)=")/(?!/)')


def prefix_links(html):
    return ROOT_LINK.sub(lambda m: m.group(1) + BASE, html)


def main():
    if DST.exists():
        shutil.rmtree(DST)
    for src in SRC.rglob("*"):
        rel = src.relative_to(SRC)
        if src.is_dir() or rel.name in SKIP:
            continue
        out = DST / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        if rel.as_posix() == "robots.txt":
            lines = src.read_text().splitlines()
            kept = [l for l in lines if not l.lower().startswith("sitemap:")]
            out.write_text("\n".join(kept).rstrip() + "\n")
        elif rel.as_posix() == "contact/index.html":
            html = src.read_text()
            if FORM_LOCAL not in html:
                raise SystemExit("contact form markup changed: update FORM_LOCAL in sync_mirror.py")
            out.write_text(prefix_links(html.replace(FORM_LOCAL, FORM_REMOTE)))
        elif rel.suffix == ".html":
            out.write_text(prefix_links(src.read_text()))
        else:
            shutil.copy2(src, out)
    (DST / ".nojekyll").write_text("")
    print(f"docs/ rebuilt from dist/ ({sum(1 for p in DST.rglob('*') if p.is_file())} files)")


if __name__ == "__main__":
    main()
