# [中文](README.md) | English

# ⭐If you find this plugin useful, please give my repository a star!
Your support is my motivation to keep updating it.
Contributions and improvements from everyone are also very welcome!

# ⭐GitHub Repository: https://github.com/zhongjiahao-M/shortcut-color-plugin.git
# Shortcut Color Plugin

A powerful SiYuan plugin that allows you to quickly format text with custom colors, background colors and styles using keyboard shortcuts.

## Screenshots

![preview](preview.png)

## Features

- **Cross-Platform Compatibility**: Perfect support for Windows and macOS systems with automatic platform-specific shortcuts
- **Custom Keyboard Shortcuts**: Create personalized shortcuts for text formatting
- **Color Customization**: Choose any color for text and background
- **Style Combinations**: Support for bold, italic, text color, and background color in any combination
- **Smart Hotkey Capture**: Click input field and press key combinations to set shortcuts
- **Dock Panel**: Convenient dock panel for quick access to all shortcuts
- **Format Conversion**: One-click conversion from old formats to SiYuan standard format
- **Notification Settings**: Customizable notifications for successful formatting
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Undo Support**: All formatting can be undone with Cmd+Z (Ctrl+Z)
- **Optimized Interface**: Wider color pickers for better usability

## Default Shortcuts

The plugin automatically configures different shortcuts based on your operating system:

### macOS System
- `⌃R` - Red bold text
- `⌃B` - Blue bold text  
- `⌃O` - Orange bold text
- `⌃P` - Purple bold text
- `⌃K` - Black text (no bold)

### Windows System
- `Alt+R` - Red bold text
- `Alt+B` - Blue bold text  
- `Alt+O` - Orange bold text
- `Alt+P` - Purple bold text
- `Ctrl+K` - Black text (no bold)

### System Function Shortcuts
- `⌃⇧C` (macOS) / `Alt+Shift+C` (Windows) - Format conversion
- `⌥⌘C` (macOS) - Open dock panel

## How to Use

### Basic Usage

1. **Select text** in your SiYuan document
2. **Press a shortcut key** (e.g., `⌃R` or `Alt+R` for red bold)
3. Your text will be formatted instantly
4. Use `Cmd+Z` (or `Ctrl+Z`) to undo if needed

### Dock Panel

1. Use shortcut `⌥⌘C` to open the dock panel
2. Click any color button in the panel to quickly apply formatting
3. Click "Add New" button to create custom shortcuts

### Customizing Shortcuts

1. Open **Settings** → **Plugin Settings** → **Shortcut Color**
2. Each shortcut item displays as a card with:
   - **Title Bar**: Click directly to edit the shortcut name (editable input field)
   - **Hotkey**: Shows current hotkey, click to go to SiYuan settings to modify
   - **Text Color**: Use color input and wider color picker to set text color
   - **Background Color**: Use color input and wider color picker to set background color (leave empty for none)
   - **Style Options**: Check/uncheck for bold or italic (horizontally arranged)
3. **Adding shortcuts**: Click "Add Shortcut" button
4. **Removing shortcuts**: Click the "×" button in the top-right corner of the card
5. **Save settings**: Click "Save" to apply changes

### Format Conversion

1. Use shortcut `⌃⇧C` (macOS) or `Alt+Shift+C` (Windows)
2. The plugin will automatically scan the current document for old formats
3. Convert `<strong style="color:#xxx">` and similar formats to SiYuan standard format
4. Shows the number of converted items when complete

### Setting Hotkeys

1. **Go to SiYuan Settings** → **Hotkeys** → **Plugins** → **Shortcut Font Style**
2. **Find the corresponding command** (using the name you set) and set the hotkey
3. **Cross-platform support**: Windows and macOS use different modifier keys
4. **Requirements**: Must include at least one modifier key (Ctrl, Alt, Shift, Cmd)

### Supported Key Combinations

- **Modifier keys**: `⌃` (Ctrl), `⌥` (Alt), `⇧` (Shift), `⌘` (Cmd)
- **Regular keys**: A-Z, 0-9
- **Special keys**: Space, Arrow keys, F1-F12, Esc, Enter, Tab, etc.
- **Examples**: `⌘R`, `⌃⇧A`, `⌥F1`, `⌃⌥⇧K`

## Installation

### From SiYuan Marketplace
1. Open SiYuan → Settings → Marketplace → Plugins
2. Search for "Shortcut Color"
3. Click Install

### Manual Installation
1. Download the plugin package
2. Extract to `{workspace}/data/plugins/shortcut-color-plugin/`
3. Restart SiYuan
4. Enable the plugin in Settings → Marketplace → Downloaded

## Interface Improvements

The latest version includes important interface optimizations:
- **Simplified Name Editing**: Shortcut names are now edited directly in the card header, no separate input field needed
- **Larger Color Pickers**: Color picker width increased to 2.5x for easier color selection
- **Optimized Layout**: All labels and inputs use horizontal layout for a more compact and beautiful design
- **Uniform Alignment**: All input elements maintain consistent alignment for improved visual experience

## Tips

- **Organize by color**: Use similar colors for related content types
- **Consistent shortcuts**: Choose memorable key combinations
- **Test combinations**: Make sure shortcuts don't conflict with SiYuan's built-in shortcuts
- **Mobile friendly**: The plugin interface adapts to mobile screens
- **Style combinations**: Make full use of bold, italic, text color, and background color combinations
- **Format conversion**: Regularly use format conversion to maintain document format consistency
- **Dock panel**: Use the dock panel for quick access to frequently used formats
- **Intuitive naming**: Give shortcuts easy-to-understand names for better management

## Troubleshooting

**Shortcuts not working?**
- Check if the key combination conflicts with system shortcuts
- Ensure the plugin is enabled
- Try restarting SiYuan

**Can't undo formatting?**
- The plugin supports native undo (Cmd+Z/Ctrl+Z)
- If issues persist, try selecting the formatted text and applying a different format

**Settings not saving?**
- Make sure to click "Save" after making changes
- Check if SiYuan has write permissions to the plugin directory

## License

MIT License

## Author

zhongjiahao