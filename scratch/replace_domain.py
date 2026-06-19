import os
import re

directory = '/Users/apple/Downloads/MohitSales_Node'

# Files to skip (like node_modules, .git, etc.)
exclude_dirs = {'.git', 'node_modules', '.next', 'scratch'}

# We want to replace 'https://mohitscpl.com' with 'https://mohit.bdm.co.in'
# And also 'mohitscpl.com' in the context of NEXT_PUBLIC_BASE_URL defaults:
# e.g., process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com'
# We will just do a global replace of 'https://mohitscpl.com' -> 'https://mohit.bdm.co.in'
# And 'mohitscpl.com' -> 'mohit.bdm.co.in' BUT ONLY IF it's not preceded by '@' (to avoid replacing emails).

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            content = f.read()
        except UnicodeDecodeError:
            return # Skip binary files

    # Regular expression to match 'mohitscpl.com' that is not part of an email address
    # (?<!@) is a negative lookbehind asserting that what precedes the match is not '@'
    # Also ignore if it is preceded by an alphanumeric character (to avoid partial matches, though unlikely)
    new_content = re.sub(r'(?<![@a-zA-Z0-9])mohitscpl\.com', 'mohit.bdm.co.in', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(directory):
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.json', '.env', '.md', '.yml', '.example')):
            filepath = os.path.join(root, file)
            replace_in_file(filepath)

print("Done replacing.")
