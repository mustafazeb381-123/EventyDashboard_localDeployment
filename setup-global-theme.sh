#!/bin/bash

# Script to help set up global theme in Cursor
# This will open your global settings file where you can paste the theme settings

echo "🎨 Cursor Global Theme Setup Helper"
echo ""
echo "This script will help you open your global Cursor settings file."
echo "You can then copy the theme settings from .vscode/settings.json"
echo ""

# Detect OS and set the path
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    GLOBAL_SETTINGS="$HOME/Library/Application Support/Cursor/User/settings.json"
    echo "📍 macOS detected"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    GLOBAL_SETTINGS="$HOME/.config/Cursor/User/settings.json"
    echo "📍 Linux detected"
else
    # Windows (Git Bash or WSL)
    GLOBAL_SETTINGS="$APPDATA/Cursor/User/settings.json"
    echo "📍 Windows detected"
fi

echo "Global settings location: $GLOBAL_SETTINGS"
echo ""

# Check if file exists
if [ -f "$GLOBAL_SETTINGS" ]; then
    echo "✅ Found global settings file"
    echo "Opening in Cursor..."
    cursor "$GLOBAL_SETTINGS"
else
    echo "⚠️  Global settings file doesn't exist yet"
    echo "Creating directory structure..."
    mkdir -p "$(dirname "$GLOBAL_SETTINGS")"
    echo "{}" > "$GLOBAL_SETTINGS"
    echo "✅ Created global settings file"
    echo "Opening in Cursor..."
    cursor "$GLOBAL_SETTINGS"
fi

echo ""
echo "📋 Next steps:"
echo "1. Copy the theme-related settings from .vscode/settings.json"
echo "2. Paste them into the global settings file that just opened"
echo "3. Save the file (Cmd+S / Ctrl+S)"
echo "4. Restart Cursor to apply changes"
echo ""
echo "💡 Tip: You can also use Cursor's UI:"
echo "   Press Cmd+, (Mac) or Ctrl+, (Windows) → Search 'Color Theme'"
