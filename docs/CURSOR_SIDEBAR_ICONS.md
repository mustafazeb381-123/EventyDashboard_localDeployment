# File & Folder Icons in Cursor Sidebar (Like VS Code)

Cursor is based on VS Code. To get **file and folder icons** plus **visible file extensions** in the sidebar like in VS Code, use the steps below.

## 1. Install an icon theme (required for icons)

The sidebar icons (React logo for `.tsx`, TypeScript for `.ts`, colored folders, etc.) come from an **icon theme**, not from Cursor by default.

### Recommended: Material Icon Theme

1. Open **Extensions** in Cursor: click the Extensions icon in the left sidebar, or press `Cmd+Shift+X` (Mac) / `Ctrl+Shift+X` (Windows).
2. Search for **Material Icon Theme** (by Philipp Kief).
3. Click **Install**.
4. After install, Cursor may ask “Activate Material Icon Theme?” — click **Yes**.  
   Or set it manually: **File → Preferences → File Icon Theme → Material Icon Theme**.

This gives you:

- **Colored folder icons** (e.g. green for `src`, orange for `pages`, blue for normal folders).
- **File-type icons** (React-style for `.tsx`/`.jsx`, “TS” for `.ts`/`.js`, etc.).
- **Distinct icons** for HTML, CSS, JSON, and other types.

### Alternative: vscode-icons

- Search for **vscode-icons** (by VSCode Icons Team) in Extensions and install.
- Then: **File → Preferences → File Icon Theme → vscode-icons**.

## 2. File extensions in the sidebar

In Cursor (and VS Code), **file names in the Explorer already include the extension** (e.g. `Users.tsx`, `NewInvitation.tsx`). There is no separate “show extension” option for the sidebar — the extension is always part of the name.

If you don’t see extensions:

- Check that you’re looking at **Explorer** (file tree), not only at tabs.
- Ensure **Explorer** is open: **View → Explorer** or `Cmd+Shift+E` / `Ctrl+Shift+E`.

## 3. Project settings (this repo)

This project includes:

- **`.vscode/settings.json`**  
  - Sets `workbench.iconTheme` to `material-icon-theme` so the sidebar uses Material Icon Theme when the extension is installed.
  - Sets `workbench.activityBar.visible` to `true`, `workbench.activityBar.location` to `"side"`, and `workbench.activityBar.orientation` to `"vertical"` so the activity bar (Explorer, Search, etc.) shows on the **left sidebar** like in VS Code.
  - Optional explorer settings (sort order, file nesting) for a cleaner tree.

- **`.vscode/extensions.json`**  
  - Recommends **Material Icon Theme**.  
  - When you open the project, Cursor may prompt: “This workspace has extension recommendations.” Click **Install** to install the icon theme.

So: **install the recommended icon theme** (or another icon theme you prefer), and the sidebar will show file and folder icons and full names (with extensions) like in VS Code.

**If the Explorer/Search icon strip (activity bar) is missing:** Use **View → Appearance → Activity Bar** to turn it on, or `Cmd+Shift+P` → **View: Toggle Activity Bar Visibility**. This workspace also sets `workbench.activityBar.visible` to `true`; reload the window (**Developer: Reload Window**) if needed.

## 4. If icons still don’t appear

1. **Reload the window**  
   - Command Palette: `Cmd+Shift+P` / `Ctrl+Shift+P` → “Developer: Reload Window”.

2. **Confirm the icon theme**  
   - **File → Preferences → File Icon Theme** and ensure **Material Icon Theme** (or your chosen theme) is selected.

3. **Use Cursor’s built-in Seti icons**  
   - If you prefer not to install an extension: **File → Preferences → File Icon Theme → Seti (Visual Studio Code)**.  
   - You get basic file/folder icons; colors and style are more limited than Material Icon Theme.

## Summary

| What you want              | What to do                                                                 |
|----------------------------|----------------------------------------------------------------------------|
| File & folder icons        | Install **Material Icon Theme** (or **vscode-icons**) and set as File Icon Theme. |
| Extensions in sidebar       | They’re always shown (e.g. `Users.tsx`); use Explorer view.               |
| Same look as your VS Code  | Use the same icon theme in Cursor (e.g. Material Icon Theme) and reload.  |

After installing and activating the icon theme, the Cursor sidebar will show file and folder icons and full file names (with extensions) in the same way as in VS Code.
