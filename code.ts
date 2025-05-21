let modifiedCount = 0;
const modifiedLogs: string[] = [];

/**
 * Получает путь к узлу, включая страницу и родителей
 */
function getNodePath(node: BaseNode): string {
  const parts: string[] = [];
  let current: BaseNode | PageNode | DocumentNode | null = node;

  while (current && current.type !== "DOCUMENT") {
    if ("name" in current) {
      parts.push(`${current.type}: ${current.name}`);
    }
    current = current.parent as BaseNode | PageNode | DocumentNode | null;
  }

  return parts.reverse().join(" → ");
}

/**
 * Форматирует лог для вывода в консоль
 */
function formatLog(path: string): string {
  const parts = path.split(" → ");
  if (parts.length === 0) return "";

  let output = `🔧 Disabled Clip Content:\n`;
  output += `📄 ${parts[0]}\n`;

  for (let i = 1; i < parts.length - 1; i++) {
    output += `├─ ${parts[i]}\n`;
  }

  if (parts.length > 1) {
    output += `└─ ${parts[parts.length - 1]}`;
  }

  return output;
}

/**
 * Рекурсивно отключает clipsContent и логгирует путь
 */
async function walk(node: BaseNode) {
  if ("clipsContent" in node && node.clipsContent) {
    if (node.type !== "INSTANCE") {
      try {
        node.clipsContent = false;
        modifiedCount++;

        const path = getNodePath(node);
        modifiedLogs.push(path);
        console.log(formatLog(path));
      } catch (err) {
        console.warn(`❗ Cannot modify node ${node.name}:`, err);
      }
    } else {
      console.log(`⏭ Skipped INSTANCE: ${getNodePath(node)}`);
    }
  }

  if ("children" in node) {
    for (const child of node.children) {
      await walk(child);
    }
  }
}

/**
 * Главная функция плагина
 */
async function main() {
  await figma.loadAllPagesAsync();

  const selection = figma.currentPage.selection;
  modifiedCount = 0;
  modifiedLogs.length = 0;

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
