import re

log_path = r"C:\Users\natha\.gemini\antigravity\brain\1b78172a-dd50-4526-9560-94e9f1e69815\.system_generated\logs\overview.txt"
styles_path = r"c:\Users\natha\Downloads\mcartetest\styles.css"

with open(log_path, "r", encoding="utf-8") as f:
    text = f.read()

# We need to find the write_to_file call that wrote styles.css before the user overwrote it.
# Look for: TargetFile:"c:\Users\natha\Downloads\mcartetest\styles.css"
blocks = text.split("call:default_api:write_to_file")

styles_content = None
for block in blocks:
    if "TargetFile:" in block and "styles.css" in block and "body {" in block:
        # We found a block that contains body { ... meaning it's the full CSS.
        # Now extract the CodeContent
        # It's inside CodeContent:\u1040... or similar.
        start_idx = block.find("CodeContent:")
        if start_idx != -1:
            # find where Description: starts
            end_idx = block.find(",Description:")
            if end_idx != -1:
                # remove CodeContent: and any quotes
                content = block[start_idx + 12:end_idx]
                if content.startswith('\u1040'):
                    content = content[1:]
                if content.endswith('\u1040'):
                    content = content[:-1]
                
                styles_content = content
                break

if styles_content:
    with open(styles_path, "r", encoding="utf-8") as f:
        new_css = f.read()
    
    with open(styles_path, "w", encoding="utf-8") as f:
        f.write(styles_content + "\n" + new_css)
    print("Successfully restored styles.css and appended new CSS!")
else:
    print("Failed to find original styles.css in the log.")
