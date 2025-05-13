# 🧩 Disable “Clip Content” (Figma Plugin)

A Figma plugin that disables the “Clip content” property on supported layers – either across the entire file or just the selected ones.

Originally built for internal use at DevExpress, it helps reduce noise in exported SVGs by removing unnecessary `<clipPath>` wrappers and keeping the markup clean.

The plugin is available on [Figma Community](https://www.figma.com/community), and this repository contains its source code.

---

## ✅ What it does

- Recursively scans **either the selection or the entire file**
- Disables `clipsContent = true` for supported node types:
  - `FrameNode`
  - `ComponentNode`
  - `InstanceNode`
  - `ComponentSetNode` (Variants)
  - `SectionNode`
- Shows a clear notification with the result:
  - `✅ Disabled 12 nodes with "Clip content" (entire file).`
  - `ℹ️ No nodes with "Clip content" found (selected).`

---

## 🚀 How to use

1. Open any Figma file  
2. (Optionally) select the layers you want to process  
3. Run the plugin via:  
   `Plugins → Disable "Clip content"`  
4. The plugin will:
   - Load all pages
   - Process either the selection or the entire file
   - Disable `clipsContent` where applicable  
5. You'll see a summary notification
