import re

# Read the JavaScript file
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace autoReplaceArrow function
old_function = r'''function autoReplaceArrow\(element\) \{
    const val = element\.value;
    if \(val\.includes\('->' \)\) \{
        const cursor = element\.selectionStart;
        const newVal = val\.replace\(/->/g, '→'\);
        element\.value = newVal;

        // Adjust cursor position \(subtract 1 for each replacement before cursor\)
        const diff = val\.length - newVal\.length;
        element\.setSelectionRange\(cursor - diff, cursor - diff\);
    \}
\}'''

new_function = '''function autoReplaceArrow(element) {
    const val = element.value;
    const cursor = element.selectionStart;
    let newVal = val;
    
    // Replace both -> and -- with →
    if (val.includes('->') || val.includes('--')) {
        newVal = val.replace(/->/g, '→').replace(/--/g, '→');
        element.value = newVal;
        
        // Adjust cursor position (subtract 1 for each replacement before cursor)
        const diff = val.length - newVal.length;
        element.setSelectionRange(cursor - diff, cursor - diff);
    }
}'''

# Replace
content = re.sub(old_function, new_function, content, flags=re.MULTILINE)

# Write back
with open(r'd:\이갑종\App\3Dstudies\js\script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Auto-replace updated! Now both -> and -- will convert to arrow.")
