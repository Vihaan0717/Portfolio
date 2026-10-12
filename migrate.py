import os

workspace = r"c:\Users\anger\Desktop\STUDUM\STD\agentic-portfolio"
os.chdir(workspace)

# 1. Append CSS
with open("lab-models.css", "r", encoding="utf-8") as f:
    css = f.read()
with open("styles.css", "a", encoding="utf-8") as f:
    f.write("\n" + css)

# 2. Append JS
with open("lab-models.js", "r", encoding="utf-8") as f:
    js = f.read()
with open("script.js", "a", encoding="utf-8") as f:
    f.write("\n" + js)

# 3. Read models HTML block
with open("lab-models.html", "r", encoding="utf-8") as f:
    lines = f.readlines()
    
# Extract lines 22 to 73
models_html = "".join(lines[21:73])

# Remove the link back to live lab from models-end
models_html = models_html.replace('<a class="button button-lime" href="index.html#live-lab"><span>Back to the Live Lab</span><b>↗</b></a>', '')

# 4. Inject into index.html
with open("index.html", "r", encoding="utf-8") as f:
    idx = f.read()

# Replace the link to lab-models.html with a scroll link
idx = idx.replace('<a class="lab-model-link" href="lab-models.html">TRY 4 VISUAL MODELS <b>↗</b></a>', '<a class="lab-model-link" href="#models">TRY 4 VISUAL MODELS <b>↓</b></a>')

# Insert models_html after </section> of live-lab (which is followed by <section class="approach)
target = '</section>\n\n      <section class="approach'
new_content = f'</section>\n\n{models_html}\n\n      <section class="approach'

if target in idx:
    idx = idx.replace(target, new_content)
    print("Injected into index.html")
else:
    print("Could not find insertion point!")
    
with open("index.html", "w", encoding="utf-8") as f:
    f.write(idx)

# Delete lab-models files as they are merged now
try:
    os.remove("lab-models.html")
    os.remove("lab-models.css")
    os.remove("lab-models.js")
    print("Cleaned up old files.")
except Exception as e:
    print("Could not clean up:", e)

print("Migration successful.")
