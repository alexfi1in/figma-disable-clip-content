let modifiedCount = 0;

/**
 * Recursively walks through the node and its children,
 * disables “Clip content” if enabled, and counts affected nodes.
 */
async function walk(node: BaseNode) {
  if ("clipsContent" in node && node.clipsContent) {
    node.clipsContent = false;
    modifiedCount++;
  }

  if ("children" in node) {
    for (const child of node.children) {
      await walk(child);
    }
  }
}

/**
 * Main function of the plugin.
 * If selection exists — process only selected nodes.
 * Otherwise — walk through all pages in the document.
 * Shows a summary message at the end.
 */
async function main() {
  await figma.loadAllPagesAsync();

  const selection = figma.currentPage.selection;
  modifiedCount = 0;

  const isSelection = selection.length > 0;

  if (isSelection) {
    for (const node of selection) {
      await walk(node);
    }
  } else {
    const pages = figma.root.children;
    for (const page of pages) {
      if (page.type === "PAGE") {
        for (const node of page.children) {
          await walk(node);
        }
      }
    }
  }

  let message = "";

  if (modifiedCount > 0) {
    message = isSelection
      ? `✅ Disabled ${modifiedCount} nodes with “Clip content” (selected).`
      : `✅ Disabled ${modifiedCount} nodes with “Clip content” (entire file).`;
  } else {
    message = isSelection
      ? `ℹ️ No nodes with “Clip content” found (selected).`
      : `ℹ️ No nodes with “Clip content” found (entire file).`;
  }

  console.log(message);
  figma.notify(message);
  figma.closePlugin();
}

main();
