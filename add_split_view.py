# Add split-view layout to CSS
with open('d:/App/3d Studies/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Find the position to insert split-view CSS (before .theory-panel)
insert_marker = '.theory-panel,'

split_view_css = '''/* Split-view layout for theory screen */
.split-view {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-top: 20px;
}

'''

# Insert split-view CSS before .theory-panel
if insert_marker in css and '.split-view' not in css:
    css = css.replace(insert_marker, split_view_css + insert_marker)
    
    # Also add responsive design at the end of the file, before the last closing brace
    responsive_css = '''
/* Responsive: Stack vertically on smaller screens */
@media (max-width: 1024px) {
    .split-view {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .theory-content {
        max-height: 300px;
    }
}
'''
    
    # Find a good place to add responsive CSS (before the last few lines)
    # Add it before the dark mode toggle section
    if '#dark-mode-toggle {' in css:
        css = css.replace('#dark-mode-toggle {', responsive_css + '\n#dark-mode-toggle {')
    
    with open('d:/App/3d Studies/css/style.css', 'w', encoding='utf-8') as f:
        f.write(css)
    
    print("✅ Split-view CSS added successfully!")
    print("   - Horizontal layout: grid-template-columns: 1fr 1fr")
    print("   - Gap: 30px")
    print("   - Responsive design for screens < 1024px")
else:
    print("⚠️  Split-view CSS already exists or marker not found")
