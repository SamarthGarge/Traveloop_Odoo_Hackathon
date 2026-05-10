import re, glob, os
def resolve_conflicts(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex to match conflict markers and keep the HEAD part
    # Pattern:
    # <<<<<<< HEAD\n
    # (content1)
    # =======\n
    # (content2)
    # >>>>>>> branch_name\n
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n.*?\n>>>>>>> [^\n]*\n', re.DOTALL)
    
    new_content, count = pattern.subn(r'\1\n', content)
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Resolved {count} conflicts in {filepath}")

for root, dirs, files in os.walk('../'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            resolve_conflicts(os.path.join(root, file))
