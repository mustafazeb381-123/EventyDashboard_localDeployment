# Cursor Theme Setup Guide

This guide will help you achieve the dark theme shown in your screenshot.

## ⚠️ Important: Workspace vs Global Settings

### Current Setup (Project-Specific)

The `.vscode/settings.json` file in this project folder only applies to **this project**. If you want the theme to apply to **all projects**, you need to configure global user settings.

### How to Apply Theme Globally (All Projects)

**Option 1: Using Cursor UI (Easiest)**

1. Open Cursor
2. Press `Cmd+,` (Mac) or `Ctrl+,` (Windows) to open Settings
3. Search for "Color Theme"
4. Select your preferred theme from the dropdown
5. This will apply globally to all projects

**Option 2: Edit Global Settings File**

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type "Preferences: Open User Settings (JSON)"
3. Copy the theme-related settings from `.vscode/settings.json` into your user settings
4. Save the file

**Location of Global Settings:**

- **Mac**: `~/Library/Application Support/Cursor/User/settings.json`
- **Windows**: `%APPDATA%\Cursor\User\settings.json`
- **Linux**: `~/.config/Cursor/User/settings.json`

## Quick Setup Methods

### Method 1: Using Cursor's Command Palette (Recommended)

1. **Open Command Palette**: Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Search for Theme**: Type "Preferences: Color Theme"
3. **Select Theme**: Choose one of these popular dark themes:
   - **Default Dark+** (built-in, similar to your screenshot)
   - **One Dark Pro** (very popular)
   - **Dracula Official** (purple accents)
   - **Material Theme** (Material Design colors)
   - **Night Owl** (great for night coding)

### Method 2: Install Themes from Extensions

1. **Open Extensions**: Click the Extensions icon in the left sidebar (or press `Cmd+Shift+X`)
2. **Search for Themes**: Type "theme" in the search bar
3. **Popular Dark Themes to Try**:
   - `One Dark Pro` by binaryify
   - `Dracula Official` by Dracula Theme
   - `Material Theme` by Equinusocio
   - `Night Owl` by Sarah Drasner
   - `GitHub Dark` by GitHub
   - `Monokai Pro` by monokai

### Method 3: Customize Colors (Advanced)

The `.vscode/settings.json` file in this project already includes custom color settings. You can:

1. **Edit Settings**: Open `.vscode/settings.json` and modify the color values
2. **Use Color Picker**: In Cursor, go to `Settings` → `Color Customizations` to use a visual editor

## Color Scheme from Your Screenshot

Based on your screenshot, here are the color mappings:

- **Keywords** (`const`, `function`, `return`): Purple/Magenta (`#c586c0`)
- **Variables** (`Badges`, `React`, `useState`): Light Blue/Teal (`#9cdcfe`)
- **Strings** (`"create_eventId"`): Green (`#ce9178`)
- **Numbers** (`2085`, `2116`): Light Blue/Yellow (`#b5cea8`)
- **Comments** (`// Original badge state`): Gray/Green (`#6a9955`)
- **Background**: Dark Gray/Charcoal (`#1e1e1e`)
- **Sidebar**: Slightly lighter dark (`#252526`)

## Recommended Fonts

For the best experience, install one of these monospace fonts:

1. **Fira Code** (with ligatures) - [Download](https://github.com/tonsky/FiraCode)
2. **Cascadia Code** - [Download](https://github.com/microsoft/cascadia-code)
3. **JetBrains Mono** - [Download](https://www.jetbrains.com/lp/mono/)

After installing, update the `editor.fontFamily` in `.vscode/settings.json`.

## Additional Customizations

### Icon Theme

The settings file includes `vs-seti` icon theme. To change:

1. Install icon themes from Extensions
2. Popular ones: `Material Icon Theme`, `vscode-icons`, `Monokai Pro Icons`

### Font Ligatures

Font ligatures are enabled in the settings. Make sure you're using a font that supports them (like Fira Code).

### Bracket Pair Colorization

Enabled in settings - helps match brackets with colors.

## Troubleshooting

1. **Theme not applying?**

   - Restart Cursor
   - Check if the theme extension is installed and enabled

2. **Colors look different?**

   - Some themes override token colors
   - Try adjusting `editor.tokenColorCustomizations` in settings

3. **Font not working?**

   - Make sure the font is installed on your system
   - Use the font name exactly as it appears in your system

## Quick Theme Switch

You can quickly switch themes using:

- `Cmd+K Cmd+T` (Mac) or `Ctrl+K Ctrl+T` (Windows/Linux)

## Need More Help?

- Check Cursor's official documentation
- Visit VS Code theme marketplace (themes work in Cursor too)
- Customize further in `Settings` → `Color Customizations`
