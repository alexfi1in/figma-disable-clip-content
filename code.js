"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let modifiedCount = 0;
const modifiedLogs = [];
/**
 * Получает путь к узлу, включая страницу и родителей
 */
function getNodePath(node) {
    const parts = [];
    let current = node;
    while (current && current.type !== "DOCUMENT") {
        if ("name" in current) {
            parts.push(`${current.type}: ${current.name}`);
        }
        current = current.parent;
    }
    return parts.reverse().join(" → ");
}
/**
 * Форматирует лог для вывода в консоль
 */
function formatLog(path) {
    const parts = path.split(" → ");
    if (parts.length === 0)
        return "";
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
function walk(node) {
    return __awaiter(this, void 0, void 0, function* () {
        if ("clipsContent" in node && node.clipsContent) {
            if (node.type !== "INSTANCE") {
                try {
                    node.clipsContent = false;
                    modifiedCount++;
                    const path = getNodePath(node);
                    modifiedLogs.push(path);
                    console.log(formatLog(path));
                }
                catch (err) {
                    console.warn(`❗ Cannot modify node ${node.name}:`, err);
                }
            }
            else {
                console.log(`⏭ Skipped INSTANCE: ${getNodePath(node)}`);
            }
        }
        if ("children" in node) {
            for (const child of node.children) {
                yield walk(child);
            }
        }
    });
}
/**
 * Главная функция плагина
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.loadAllPagesAsync();
        const selection = figma.currentPage.selection;
        modifiedCount = 0;
        modifiedLogs.length = 0;
        const isSelection = selection.length > 0;
        if (isSelection) {
            for (const node of selection) {
                yield walk(node);
            }
        }
        else {
            const pages = figma.root.children;
            for (const page of pages) {
                if (page.type === "PAGE") {
                    for (const node of page.children) {
                        yield walk(node);
                    }
                }
            }
        }
        let message = "";
        if (modifiedCount > 0) {
            message = isSelection
                ? `✅ Disabled ${modifiedCount} nodes with “Clip content” (selected).`
                : `✅ Disabled ${modifiedCount} nodes with “Clip content” (entire file).`;
        }
        else {
            message = isSelection
                ? `ℹ️ No nodes with “Clip content” found (selected).`
                : `ℹ️ No nodes with “Clip content” found (entire file).`;
        }
        console.log(message);
        figma.notify(message);
        figma.closePlugin();
    });
}
main();
