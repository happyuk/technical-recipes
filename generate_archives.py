import os
import re
from pathlib import Path
from collections import defaultdict
import calendar

SITE_DIR = os.path.expanduser("~/technical-recipes-site")
BASE_URL = "/technical-recipes"

MONTHS = {v: k for k, v in enumerate(calendar.month_name)}

def get_post_date_and_title(html_file):
    try:
        with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Extract title
        title_match = re.search(r'<title>(.*?)\s*[–-]\s*technical-recipes', content)
        if not title_match:
            title_match = re.search(r'<title>(.*?)</title>', content)
        title = title_match.group(1).strip() if title_match else "Untitled"

        # Extract date in format "16 September 2022"
        date_match = re.search(r'<span>(\d{1,2})\s+(\w+)\s+(\d{4})</span>', content)
        if date_match:
            day = date_match.group(1).zfill(2)
            month = str(MONTHS.get(date_match.group(2), 0)).zfill(2)
            year = date_match.group(3)
            if month != '00':
                return title, f"{year}-{month}-{day}"

        return title, None
    except Exception as e:
        return None, None

def generate_month_index(year, month, posts, output_path):
    month_name = calendar.month_name[int(month)]
    
    post_links = ""
    for title, url in sorted(posts, key=lambda x: x[0]):
        post_links += f'<li><a href="{url}">{title}</a></li>\n'

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{month_name} {year} - technical-recipes.com</title>
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }}
        h1 {{ color: #333; }}
        ul {{ line-height: 2; }}
        a {{ color: #0066cc; text-decoration: none; }}
        a:hover {{ text-decoration: underline; }}
        .back {{ margin-bottom: 20px; }}
    </style>
</head>
<body>
    <div class="back"><a href="{BASE_URL}/">← Home</a></div>
    <h1>Posts from {month_name} {year}</h1>
    <ul>
        {post_links}
    </ul>
</body>
</html>"""

    os.makedirs(output_path, exist_ok=True)
    with open(os.path.join(output_path, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Created {output_path}/index.html with {len(posts)} posts")

def main():
    month_posts = defaultdict(list)

    for year in range(2010, 2027):
        year_dir = os.path.join(SITE_DIR, str(year))
        if not os.path.isdir(year_dir):
            continue

        for post_folder in os.listdir(year_dir):
            post_path = os.path.join(year_dir, post_folder)
            html_file = os.path.join(post_path, 'index.html')

            if not os.path.isfile(html_file):
                continue

            title, date = get_post_date_and_title(html_file)
            if not date:
                continue

            post_year, post_month, _ = date.split('-')
            url = f"{BASE_URL}/{year}/{post_folder}/"
            month_posts[(post_year, post_month)].append((title, url))

    for (year, month), posts in month_posts.items():
        output_path = os.path.join(SITE_DIR, year, month)
        generate_month_index(year, month, posts, output_path)

    print(f"\nDone! Generated {len(month_posts)} month archive pages.")

if __name__ == "__main__":
    main()
