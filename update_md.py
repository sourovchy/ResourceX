import re

with open('generated_tree.txt', 'r') as f:
    content = f.read()

backend_tree = content.split('Frontend:\n')[0].replace('Backend:\n', '').strip()
frontend_tree = content.split('Frontend:\n')[1].split('Database:\n')[0].strip()
database_tree = content.split('Database:\n')[1].strip()

with open('markdown/PROJECT_STRUCTURE.md', 'r') as f:
    md = f.read()

def replace_section(md, header, new_tree):
    # Regex to find a block of text bounded by ```text and ``` after the header
    pattern = r'(' + re.escape(header) + r'[^`]*```text\n).*?(\n```)'
    return re.sub(pattern, r'\1' + new_tree + r'\2', md, flags=re.DOTALL)

md = replace_section(md, '## Backend', backend_tree)
md = replace_section(md, '## Frontend', frontend_tree)
md = replace_section(md, '## Database', database_tree)

with open('markdown/PROJECT_STRUCTURE.md', 'w') as f:
    f.write(md)
