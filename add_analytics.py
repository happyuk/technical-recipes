import os
import re

SITE_DIR = os.path.expanduser("~/technical-recipes-site")

GA4_SNIPPET = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-N423B0P3PW"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-N423B0P3PW');
</script>"""

def already_has_analytics(content):
    return 'G-N423B0P3PW' in content

def add_analytics(content):
    # Insert just before </head>
    return re.sub(r'(</head>)', GA4_SNIPPET + r'\n\1', content, count=1, flags=re.IGNORECASE)

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        if already_has_analytics(content):
            print(f"  SKIPPED (already has GA4): {filepath}")
            return False

        if '</head>' not in content.lower():
            print(f"  SKIPPED (no </head> tag): {filepath}")
            return False

        new_content = add_analytics(content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"  UPDATED: {filepath}")
        return True

    except Exception as e:
        print(f"  ERROR: {filepath} - {e}")
        return False

def main():
    updated = 0
    skipped = 0
    errors = 0

    for root, dirs, files in os.walk(SITE_DIR):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]

        for filename in files:
            if filename.endswith('.html'):
                filepath = os.path.join(root, filename)
                result = process_file(filepath)
                if result:
                    updated += 1
                else:
                    skipped += 1

    print(f"\nDone!")
    print(f"  Updated:  {updated} files")
    print(f"  Skipped:  {skipped} files")

if __name__ == "__main__":
    main()
