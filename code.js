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
/**
 * Recursively walks through the node and its children,
 * disables “Clip content” if enabled, and counts affected nodes.
 */
function walk(node) {
    return __awaiter(this, void 0, void 0, function* () {
        if ("clipsContent" in node && node.clipsContent) {
            node.clipsContent = false;
            modifiedCount++;
        }
        if ("children" in node) {
            for (const child of node.children) {
                yield walk(child);
            }
        }
    });
}
/**
 * Main function of the plugin.
 * If selection exists — process only selected nodes.
 * Otherwise — walk through all pages in the document.
 * Shows a summary message at the end.
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.loadAllPagesAsync();
        const selection = figma.currentPage.selection;
        modifiedCount = 0;
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
