import os

SITE_DIR = os.path.expanduser("~/technical-recipes-site")
DOWNLOADS_DIR = os.path.join(SITE_DIR, "downloads-files")
OUTPUT_FILE = os.path.join(SITE_DIR, "downloads", "index.html")
BASE_URL = "/technical-recipes"

def generate_downloads_page():
    # Get all files
    files = []
    for f in sorted(os.listdir(DOWNLOADS_DIR)):
        filepath = os.path.join(DOWNLOADS_DIR, f)
        if os.path.isfile(filepath):
            size = os.path.getsize(filepath)
            # Convert size to human readable
            if size < 1024:
                size_str = f"{size} B"
            elif size < 1024 * 1024:
                size_str = f"{size/1024:.1f} KB"
            else:
                size_str = f"{size/1024/1024:.1f} MB"
            files.append((f, size_str))

    # Generate file list HTML
    file_rows = ""
    for filename, size in files:
        url = f"{BASE_URL}/downloads-files/{filename}"
        file_rows += f"""
        <tr>
            <td><a href="{url}" download>{filename}</a></td>
            <td>{size}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Downloads - technical-recipes.com</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
            color: #333;
        }}
        h1 {{
            color: #333;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 10px;
        }}
        .nav {{
            margin-bottom: 30px;
        }}
        .nav a {{
            color: #0066cc;
            text-decoration: none;
            margin-right: 15px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }}
        th {{
            background-color: #0066cc;
            color: white;
            padding: 12px;
            text-align: left;
        }}
        td {{
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
        }}
        tr:hover {{
            background-color: #f5f5f5;
        }}
        a {{
            color: #0066cc;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
        .count {{
            color: #666;
            font-size: 0.9em;
            margin-top: 10px;
        }}
    </style>
</head>
<body>
    <div class="nav">
        <a href="{BASE_URL}/">← Home</a>
        <a href="{BASE_URL}/category/algorithms/">Algorithms</a>
        <a href="{BASE_URL}/category/c-mfc/">C++ / MFC</a>
        <a href="{BASE_URL}/category/python/">Python</a>
    </div>

    <h1>Downloads</h1>
    <p>Free downloadable code samples and projects from technical-recipes.com</p>
    <p class="count">{len(files)} files available</p>

    <table>
        <thead>
            <tr>
                <th>File</th>
                <th>Size</th>
            </tr>
        </thead>
        <tbody>
            {file_rows}
        </tbody>
    </table>
</body>
</html>"""

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Generated downloads page with {len(files)} files.")

if __name__ == "__main__":
    generate_downloads_page()
