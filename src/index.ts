import { Plugin, showMessage, Dialog, Setting, adaptHotkey, getFrontend, getAllEditor, fetchSyncPost } from "siyuan";
import "./index.scss";

const STORAGE_NAME = "shortcut-color-config";

interface ColorShortcut {
  id: string;
  hotkey: string;
  color: string;
  name: string;
  bold: boolean;
  italic: boolean;
}

interface PluginConfig {
  shortcuts: ColorShortcut[];
  showNotification: boolean;
  convertHotkey: string;
}

export default class ShortcutColorPlugin extends Plugin {
  private isMobile: boolean;
  private isWindows: boolean;
  private shortcuts: ColorShortcut[] = [];
  private showNotification = false;
  private convertHotkey = "";
  private dockInited = false;

  async onload() {
    const f = getFrontend();
    this.isMobile = f === "mobile" || f === "browser-mobile";
    this.isWindows = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("win");
    await this.loadData(STORAGE_NAME);
    this.initializeDefaultData();
    this.setupSettings();
    this.syncCommands();
    this.setupDockPanel();
  }

  onLayoutReady() {}

  onunload() {
    this.resetAllCommands();
  }

  private getPluginDisplayName(): string {
    const lang = (((window as any)?.siyuan?.config?.lang as string) || navigator.language || "en").toLowerCase();
    return lang.includes("zh") ? "快捷格式化字体样式" : "Shortcut Font Style";
  }

  private getSystemHotkey(langKey: string): string | null {
    const anyThis: any = this as any;
    const list = Array.isArray(anyThis?.commands) ? anyThis.commands : [];
    const found = list.find((c: any) => c && c.langKey === langKey);
    return found && typeof found.hotkey === "string" ? found.hotkey : null;
  }

  private refreshHotkeysFromSystem() {
    this.shortcuts.forEach(sc => {
      const langKey = this.langKeyOf(sc.id);
      const hk = this.getSystemHotkey(langKey);
      if (hk) sc.hotkey = hk;
    });
  }

  private initializeDefaultData() {
    const defaultShortcuts: ColorShortcut[] = this.isWindows
      ? [
          { id: "red", hotkey: "Alt+R", color: "#ff0000", name: "红色加粗", bold: true, italic: false },
          { id: "blue", hotkey: "Alt+B", color: "#0066cc", name: "蓝色加粗", bold: true, italic: false },
          { id: "orange", hotkey: "Alt+O", color: "#ff9900", name: "橙色加粗", bold: true, italic: false },
          { id: "purple", hotkey: "Alt+P", color: "#9966cc", name: "紫色加粗", bold: true, italic: false },
          { id: "black", hotkey: "Ctrl+K", color: "#37352F", name: "默认文本", bold: false, italic: false }
        ]
      : [
          { id: "red", hotkey: "⌃R", color: "#ff0000", name: "红色加粗", bold: true, italic: false },
          { id: "blue", hotkey: "⌃B", color: "#0066cc", name: "蓝色加粗", bold: true, italic: false },
          { id: "orange", hotkey: "⌃O", color: "#ff9900", name: "橙色加粗", bold: true, italic: false },
          { id: "purple", hotkey: "⌃P", color: "#9966cc", name: "紫色加粗", bold: true, italic: false },
          { id: "black", hotkey: "⌃K", color: "#37352F", name: "默认文本", bold: false, italic: false }
        ];
    if (!this.data[STORAGE_NAME]) {
      const defaultConvertHotkey = this.isWindows ? "Alt+Shift+C" : "⌃⇧C";
      const defaultConfig: PluginConfig = { shortcuts: defaultShortcuts, showNotification: false, convertHotkey: defaultConvertHotkey };
      this.data[STORAGE_NAME] = defaultConfig;
      this.shortcuts = defaultShortcuts;
      this.showNotification = false;
      this.convertHotkey = defaultConvertHotkey;
    } else {
      const config = this.data[STORAGE_NAME] as PluginConfig;
      const shortcuts = (config.shortcuts || []).map(s => ({ ...s, italic: s.italic !== undefined ? s.italic : false }));
      this.shortcuts = shortcuts.length ? shortcuts : defaultShortcuts;
      this.showNotification = !!config.showNotification;
      this.convertHotkey = config.convertHotkey || (this.isWindows ? "Alt+Shift+C" : "⌃⇧C");
    }
  }

  private setupSettings() {
    const plugin = this;
    this.setting = new Setting({
      confirmCallback: () => {
        const config: PluginConfig = { shortcuts: plugin.shortcuts, showNotification: plugin.showNotification, convertHotkey: plugin.convertHotkey };
        plugin.saveData(STORAGE_NAME, config);
        plugin.syncCommands();
        showMessage("设置已保存");
      }
    });

    this.setting.addItem({
      title: "通知设置",
      description: "设置是否显示格式应用成功的通知",
      createActionElement: () => {
        const container = document.createElement("div");
        container.className = "notification-settings";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "show-notification";
        checkbox.checked = plugin.showNotification;
        checkbox.addEventListener("change", e => {
          plugin.showNotification = (e.target as HTMLInputElement).checked;
        });
        const label = document.createElement("label");
        label.htmlFor = "show-notification";
        label.textContent = "显示格式应用成功通知";
        container.appendChild(checkbox);
        container.appendChild(label);
        queueMicrotask(() => {
          const row = container.closest(".b3-label.config__item");
          row?.classList.add("sc-compact-row");
        });
        return container;
      }
    });

    this.setting.addItem({
      title: "快捷键设置",
      description: "配置自定义颜色与样式（快捷键需在思源设置中修改）",
      createActionElement: () => {
        const container = document.createElement("div");
        container.className = "shortcut-color-settings";
        plugin.renderShortcutSettings(container);
        queueMicrotask(() => {
          const row = container.closest(".b3-label.config__item");
          row?.classList.add("sc-compact-row");
        });
        return container;
      }
    });

    this.setting.addItem({
      title: "",
      description: "",
      createActionElement: () => {
        const container = document.createElement("div");
        container.className = "convert-settings";
        plugin.renderConvertSettings(container);
        queueMicrotask(() => {
          const row = container.closest(".b3-label.config__item") as HTMLElement | null;
          if (row) {
            const left = row.querySelector(".fn__flex-1") as HTMLElement | null;
            left?.remove();
            row.classList.add("sc-no-flex", "sc-compact-row");
            row.style.display = "block";
            const content = row.querySelector(".b3-label__content") as HTMLElement | null;
            if (content) content.style.width = "100%";
          }
        });
        return container;
      }
    });
  }

  private renderConvertSettings(container: HTMLElement) {
    container.innerHTML = `
      <div class="shortcut-color-list">
        <div class="shortcut-color-item convert-function-item">
          <div class="shortcut-item-header">
            <h4 class="shortcut-item-title">格式转换功能</h4>
            <span class="function-badge">系统功能</span>
          </div>
          <div class="shortcut-item-content convert-content">
            <div class="convert-description">
              <p><strong>功能说明：</strong></p>
              <p>将文档中旧格式的 <code>&lt;strong style="color:#xxx"&gt;</code> 或被转义形式转换为可持久化的标准标记。</p>
              <p><strong>转换示例（目标）：</strong></p>
              <p><code>&lt;span data-type="strong" style="color:#7A5FFF;"&gt;作用是相互的&lt;/span&gt;</code></p>
            </div>
            <div class="shortcut-input-group">
              <label>转换快捷键:</label>
              <input type="text" class="b3-text-field convert-hotkey" value="${this.convertHotkey}" placeholder="点击后按下快捷键" readonly>
            </div>
          </div>
        </div>
      </div>
    `;
    const hotkeyInput = container.querySelector(".convert-hotkey") as HTMLInputElement;
    const startCapture = () => this.startConvertHotkeyCapture(hotkeyInput);
    hotkeyInput?.addEventListener("click", startCapture);
    hotkeyInput?.addEventListener("focus", startCapture);
  }

  private startConvertHotkeyCapture(input: HTMLInputElement) {
    if (input.classList.contains("capturing")) return;
    input.placeholder = "按下快捷键组合...";
    input.classList.add("capturing");
    input.focus();
    input.select();
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const keys: string[] = [];
      if (e.ctrlKey) keys.push("⌃");
      if (e.altKey) keys.push("⌥");
      if (e.shiftKey) keys.push("⇧");
      if (e.metaKey) keys.push("⌘");
      if (e.key && !["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
        let keyName = e.key;
        switch (e.key) {
          case " ": keyName = "Space"; break;
          case "ArrowUp": keyName = "↑"; break;
          case "ArrowDown": keyName = "↓"; break;
          case "ArrowLeft": keyName = "←"; break;
          case "ArrowRight": keyName = "→"; break;
          case "Escape": keyName = "Esc"; break;
          case "Delete": keyName = "Del"; break;
          case "Backspace": keyName = "⌫"; break;
          case "Enter": keyName = "↵"; break;
          case "Tab": keyName = "⇥"; break;
          default: keyName = e.key.length === 1 ? e.key.toUpperCase() : keyName;
        }
        keys.push(keyName);
      }
      const ok = keys.length >= 2 || (keys.length === 1 && ["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","Esc","⌫","↵","⇥"].includes(keys[0]));
      if (ok) {
        const hotkey = keys.join("");
        input.value = hotkey;
        this.convertHotkey = hotkey;
        this.finishConvertHotkeyCapture(input, handleKeyDown);
      } else if (e.key === "Escape") {
        this.finishConvertHotkeyCapture(input, handleKeyDown);
      }
    };
    const handleBlur = () => this.finishConvertHotkeyCapture(input, handleKeyDown, handleBlur);
    input.addEventListener("keydown", handleKeyDown);
    input.addEventListener("blur", handleBlur);
    setTimeout(() => {
      if (input.classList.contains("capturing")) this.finishConvertHotkeyCapture(input, handleKeyDown, handleBlur);
    }, 10000);
  }

  private finishConvertHotkeyCapture(input: HTMLInputElement, keydownHandler: (e: KeyboardEvent) => void, blurHandler?: () => void) {
    input.placeholder = "点击设置快捷键";
    input.classList.remove("capturing");
    input.removeEventListener("keydown", keydownHandler);
    if (blurHandler) input.removeEventListener("blur", blurHandler);
    input.blur();
  }

  private renderShortcutSettings(container: HTMLElement) {
    this.refreshHotkeysFromSystem();
    container.innerHTML = `
      <div class="shortcut-color-list">
        ${this.shortcuts
          .map(
            (shortcut, index) => `
          <div class="shortcut-color-item" data-index="${index}">
            <div class="shortcut-item-header">
              <h4 class="shortcut-item-title">${shortcut.name || "新快捷键"}</h4>
              <button class="b3-button b3-button--cancel remove-shortcut" title="删除">×</button>
            </div>
            <div class="shortcut-item-content">
              <div class="shortcut-input-group">
                <label>名称:</label>
                <input type="text" class="b3-text-field shortcut-name" value="${shortcut.name}" placeholder="请输入快捷键名称">
              </div>
              <div class="shortcut-input-group">
                <label>快捷键:</label>
                <input type="text" class="b3-text-field shortcut-hotkey" value="${shortcut.hotkey}" placeholder="前往思源设置修改" readonly>
              </div>
              <div class="shortcut-input-group">
                <label>颜色:</label>
                <input type="color" class="shortcut-color" value='${shortcut.color}'>
              </div>
              <div class="shortcut-input-group">
                <div class="fn__flex" style="margin-bottom:8px;">
                  <label class="fn__flex-center" style="width:60px;">加粗:</label>
                  <input type="checkbox" class="shortcut-bold format-checkbox" ${shortcut.bold ? "checked" : ""}>
                </div>
                <div class="fn__flex">
                  <label class="fn__flex-center" style="width:60px;">斜体:</label>
                  <input type="checkbox" class="shortcut-italic format-checkbox" ${shortcut.italic ? "checked" : ""}>
                </div>
              </div>
            </div>
          </div>`
          )
          .join("")}
        <div class="shortcut-color-item add-shortcut-item">
          <button class="b3-button b3-button--outline add-shortcut">
            <span class="add-icon">+</span>
            <span class="add-text">添加快捷键</span>
          </button>
        </div>
      </div>
    `;
    const addButton = container.querySelector(".add-shortcut") as HTMLButtonElement;
    addButton?.addEventListener("click", () => {
      const s: ColorShortcut = { id: `custom_${Date.now()}`, hotkey: "", color: "var(--b3-font-color13)", name: "新快捷键", bold: true, italic: false };
      this.shortcuts.push(s);
      this.renderShortcutSettings(container);
    });
    container.querySelectorAll(".remove-shortcut").forEach((_button, index) => {
      _button.addEventListener("click", () => {
        const removed = this.shortcuts.splice(index, 1)[0];
        if (removed) {
          const langKey = this.langKeyOf(removed.id);
          const host: any = this as any;
          if (host.commands && Array.isArray(host.commands)) {
            host.commands = host.commands.filter((c: any) => !(c && c.langKey === langKey));
          }
          try {
            host.removeCommand?.(langKey);
          } catch {}
        }
        this.renderShortcutSettings(container);
      });
    });
    container.querySelectorAll(".shortcut-color-item").forEach((item, index) => {
      const nameInput = item.querySelector(".shortcut-name") as HTMLInputElement;
      const hotkeyInput = item.querySelector(".shortcut-hotkey") as HTMLInputElement;
      const colorInput = item.querySelector(".shortcut-color") as HTMLInputElement;
      const boldInput = item.querySelector(".shortcut-bold") as HTMLInputElement;
      const italicInput = item.querySelector(".shortcut-italic") as HTMLInputElement;
      nameInput?.addEventListener("input", () => {
        this.shortcuts[index].name = nameInput.value;
        const titleElement = item.querySelector(".shortcut-item-title");
        if (titleElement) titleElement.textContent = nameInput.value || "新快捷键";
      });
      colorInput?.addEventListener("input", () => {
        this.shortcuts[index].color = colorInput.value;
      });
      boldInput?.addEventListener("change", () => {
        this.shortcuts[index].bold = boldInput.checked;
      });
      italicInput?.addEventListener("change", () => {
        this.shortcuts[index].italic = italicInput.checked;
      });
      hotkeyInput?.addEventListener("click", () => {
        const pluginName = this.getPluginDisplayName();
        const cmdName = this.shortcuts[index].name || "";
        showMessage(`请去思源笔记 设置->快捷键->插件->${pluginName}->${cmdName} 中修改快捷键`);
      });
      hotkeyInput?.addEventListener("focus", () => {
        const pluginName = this.getPluginDisplayName();
        const cmdName = this.shortcuts[index].name || "";
        showMessage(`请去思源笔记 设置->快捷键->插件->${pluginName}->${cmdName} 中修改快捷键`);
        hotkeyInput.blur();
      });
    });
  }

  private langKeyOf(id: string) {
    return `shortcut-color-${id}`;
  }

  private resetAllCommands() {
    const host: any = this as any;
    const prefix = "shortcut-color-";
    if (host.commands && Array.isArray(host.commands)) {
      host.commands = host.commands.filter((c: any) => !(c && typeof c.langKey === "string" && c.langKey.startsWith(prefix)));
    }
    try {
      (["red","blue","orange","purple","black"].map(id => this.langKeyOf(id)).concat(["shortcut-color-convert"])).forEach(k => {
        try { host.removeCommand?.(k); } catch {}
      });
    } catch {}
  }

  private upsertCommandPreserveHotkey(langKey: string, langText: string, fallbackHotkey: string, cb: () => void) {
    const current = this.getSystemHotkey(langKey) || fallbackHotkey || "";
    const host: any = this as any;
    if (host.commands && Array.isArray(host.commands)) {
      host.commands = host.commands.filter((c: any) => !(c && c.langKey === langKey));
    }
    try { host.removeCommand?.(langKey); } catch {}
    this.addCommand({ langKey, langText, hotkey: current, callback: cb });
  }

  private syncCommands() {
    const existingIds = new Set(this.shortcuts.map(s => s.id));
    const host: any = this as any;
    const obsolete: string[] = [];
    const list = Array.isArray(host?.commands) ? host.commands : [];
    list.forEach((c: any) => {
      if (c && typeof c.langKey === "string" && c.langKey.startsWith("shortcut-color-")) {
        const id = c.langKey.replace("shortcut-color-", "");
        if (!existingIds.has(id)) obsolete.push(c.langKey);
      }
    });
    obsolete.forEach(k => {
      try { host.removeCommand?.(k); } catch {}
      if (host.commands && Array.isArray(host.commands)) {
        host.commands = host.commands.filter((c: any) => !(c && c.langKey === k));
      }
    });
    this.shortcuts.forEach(sc => {
      const langKey = this.langKeyOf(sc.id);
      this.upsertCommandPreserveHotkey(langKey, sc.name, sc.hotkey, () => {
        setTimeout(async () => {
          await this.applyColorFormat(sc.color, sc.bold, sc.italic);
        }, 10);
      });
    });
    if (this.convertHotkey) {
      this.upsertCommandPreserveHotkey("shortcut-color-convert", "转换文档格式", this.convertHotkey, () => {
        setTimeout(async () => {
          await this.convertDocumentFormats();
        }, 10);
      });
    } else {
      try { host.removeCommand?.("shortcut-color-convert"); } catch {}
      if (host.commands && Array.isArray(host.commands)) {
        host.commands = host.commands.filter((c: any) => !(c && c.langKey === "shortcut-color-convert"));
      }
    }
  }

  private computeDataType(bold: boolean, italic: boolean) {
    if (bold && italic) return "strong em";
    if (bold) return "strong";
    if (italic) return "em";
    return "";
  }

  private buildStyledSpan(text: string, color: string, bold: boolean, italic: boolean) {
    const span = document.createElement("span");
    (span.style as any).color = color;
    const t = this.computeDataType(bold, italic);
    if (t) span.setAttribute("data-type", t);
    span.textContent = text;
    return span;
  }

  private isStyledSpan(el: HTMLElement | null): el is HTMLElement {
    if (!el) return false;
    if (el.tagName !== "SPAN") return false;
    const dt = el.getAttribute("data-type");
    const c = (el.style && (el.style as any).color) || "";
    return !!dt || !!c;
  }

  private cloneStyleShell(src: HTMLElement): HTMLElement {
    const s = document.createElement("span");
    const dt = src.getAttribute("data-type");
    if (dt) s.setAttribute("data-type", dt);
    const color = (src.style as any).color;
    if (color) (s.style as any).color = color;
    return s;
  }

  private hoistFromStyledParent(el: HTMLElement) {
    let cur: HTMLElement | null = el;
    while (this.isStyledSpan(cur?.parentElement || null)) {
      const p = cur!.parentElement as HTMLElement;
      const parent = p.parentNode as Node;
      const beforeShell = this.cloneStyleShell(p);
      const afterShell = this.cloneStyleShell(p);
      const beforeNodes: Node[] = [];
      const afterNodes: Node[] = [];
      let n = p.firstChild;
      let seen = false;
      while (n) {
        const next = n.nextSibling;
        if (n === cur) { seen = true; n = next; continue; }
        if (!seen) beforeNodes.push(n);
        else afterNodes.push(n);
        n = next;
      }
      beforeNodes.forEach(nd => beforeShell.appendChild(nd));
      afterNodes.forEach(nd => afterShell.appendChild(nd));
      const insertRef = p;
      if (beforeShell.childNodes.length > 0) parent.insertBefore(beforeShell, insertRef);
      parent.insertBefore(cur!, insertRef);
      if (afterShell.childNodes.length > 0) parent.insertBefore(afterShell, insertRef);
      parent.removeChild(p);
      cur = cur!.parentElement;
    }
  }

  private sameStyled(a: HTMLElement, b: HTMLElement): boolean {
    if (!this.isStyledSpan(a) || !this.isStyledSpan(b)) return false;
    const adt = a.getAttribute("data-type") || "";
    const bdt = b.getAttribute("data-type") || "";
    const ac = (a.style as any).color || "";
    const bc = (b.style as any).color || "";
    return adt === bdt && ac === bc;
  }

  private mergeAdjacent(el: HTMLElement) {
    const prev = el.previousSibling as HTMLElement | null;
    if (prev && prev.nodeType === Node.ELEMENT_NODE && this.sameStyled(prev, el)) {
      while (el.firstChild) prev.appendChild(el.firstChild);
      el.remove();
    }
    const base = prev && prev.isConnected ? prev : el;
    const nextEl = (base as any).nextSibling as HTMLElement | null;
    if (nextEl && nextEl.nodeType === Node.ELEMENT_NODE && this.sameStyled(base as HTMLElement, nextEl)) {
      while (nextEl.firstChild) (base as HTMLElement).appendChild(nextEl.firstChild);
      nextEl.remove();
    }
  }

  private placeCaretAfter(el: Node) {
    const r = document.createRange();
    if (!el.parentNode) return;
    r.setStartAfter(el);
    r.collapse(true);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(r);
    }
  }

  private async applyColorFormat(color: string, bold = true, italic = false) {
    const editors = getAllEditor();
    if (editors.length === 0) return showMessage("请先打开一个文档");
    const protyle = editors[0].protyle;
    if (!protyle) return showMessage("请先打开一个文档");
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return showMessage("请先选择要格式化的文本");
    const range = selection.getRangeAt(0);
    if (range.collapsed) return showMessage("请先选择要格式化的文本");
    const text = this.extractCleanText(range);
    if (!text) return showMessage("请先选择要格式化的文本");
    const focusElement = range.startContainer.nodeType === Node.TEXT_NODE ? (range.startContainer as any).parentElement : (range.startContainer as Element);
    const blockElement = (focusElement?.closest("[data-node-id]") as HTMLElement) || null;
    if (!blockElement) return showMessage("无法找到当前块元素");
    const fragment = range.extractContents();
    const wrap = document.createElement("span");
    (wrap.style as any).color = color;
    const t = this.computeDataType(bold, italic);
    if (t) wrap.setAttribute("data-type", t);
    wrap.appendChild(fragment);
    range.insertNode(wrap);
    this.hoistFromStyledParent(wrap);
    this.mergeAdjacent(wrap);
    this.placeCaretAfter(wrap);
    await this.persistBlockByElement(blockElement);
    if (this.showNotification) {
      const parts: string[] = [];
      if (bold) parts.push("加粗");
      if (italic) parts.push("斜体");
      showMessage(`已应用${parts.length ? parts.join("+") : "颜色"}：${color}`);
    }
  }

  private extractCleanText(range: Range): string {
    const temp = document.createElement("div");
    try {
      const cloned = range.cloneContents();
      temp.appendChild(cloned);
      return (temp.textContent || temp.innerText || "").trim();
    } catch {
      return range.toString().trim();
    }
  }

  private async convertDocumentFormats() {
    const editors = getAllEditor();
    if (editors.length === 0) return showMessage("请先打开一个文档");
    let activeEditor: any = null;
    for (const ed of editors) {
      if (ed.protyle?.wysiwyg?.element) {
        const el = ed.protyle.element;
        if (el && !el.classList.contains("fn__none")) {
          activeEditor = ed;
          break;
        }
      }
    }
    if (!activeEditor) activeEditor = editors[0];
    const protyle = activeEditor.protyle;
    if (!protyle) return showMessage("请先打开一个文档");
    const editableElements = protyle.wysiwyg.element.querySelectorAll('[contenteditable="true"]');
    let convertedCount = 0;
    const touchedBlocks = new Set<HTMLElement>();
    editableElements.forEach((element: Element) => {
      let html = element.innerHTML;
      const escapedStrong = /&lt;strong\s+style=["']color:\s*#([A-Fa-f0-9]{3,8})["']\s*&gt;(.*?)&lt;\/strong&gt;/gis;
      html = html.replace(escapedStrong, (_m, color: string, text: string) => {
        convertedCount++;
        return `<span data-type="strong" style="color:#${color};">${text.trim()}</span>`;
      });
      const directStrong = /<strong\s+style=["']\s*color\s*:\s*#([A-Fa-f0-9]{3,8})\s*;?\s*["']\s*>(.*?)<\/strong>/gis;
      html = html.replace(directStrong, (_m, color: string, text: string) => {
        convertedCount++;
        return `<span data-type="strong" style="color:#${color};">${text.trim()}</span>`;
      });
      const strongEmNest1 = /<strong>\s*<em>\s*<span\s+style=["']\s*color\s*:\s*#([A-Fa-f0-9]{3,8})\s*;?\s*["']\s*>(.*?)<\/span>\s*<\/em>\s*<\/strong>/gis;
      html = html.replace(strongEmNest1, (_m, color: string, text: string) => {
        convertedCount++;
        return `<span data-type="strong em" style="color:#${color};">${text.trim()}</span>`;
      });
      const strongEmNest2 = /<em>\s*<strong>\s*<span\s+style=["']\s*color\s*:\s*#([A-Fa-f0-9]{3,8})\s*;?\s*["']\s*>(.*?)<\/span>\s*<\/strong>\s*<\/em>/gis;
      html = html.replace(strongEmNest2, (_m, color: string, text: string) => {
        convertedCount++;
        return `<span data-type="strong em" style="color:#${color};">${text.trim()}</span>`;
      });
      const emDirect = /<em\s+style=["']\s*color\s*:\s*#([A-Fa-f0-9]{3,8})\s*;?\s*["']\s*>(.*?)<\/em>/gis;
      html = html.replace(emDirect, (_m, color: string, text: string) => {
        convertedCount++;
        return `<span data-type="em" style="color:#${color};">${text.trim()}</span>`;
      });
      const strongWithInnerSpan = /<strong>\s*<span\s+style=["']\s*color\s*:\s*#([A-Fa-f0-9]{3,8})\s*;?\s*["']\s*>(.*?)<\/span>\s*<\/strong>/gis;
      html = html.replace(strongWithInnerSpan, (_m, color: string, text: string) => {
        convertedCount++;
        return `<span data-type="strong" style="color:#${color};">${text.trim()}</span>`;
      });
      if (html !== element.innerHTML) {
        (element as HTMLElement).innerHTML = html;
        const block = element.closest("[data-node-id]") as HTMLElement | null;
        if (block) touchedBlocks.add(block);
      }
    });
    for (const block of touchedBlocks) {
      await this.persistBlockByElement(block);
    }
    await this.flushTransaction();
    if (convertedCount > 0) showMessage(`成功转换 ${convertedCount} 个格式标签并已保存`);
    else showMessage("当前文档中没有找到需要转换的格式");
  }

  private async persistBlockByElement(blockElement: HTMLElement): Promise<void> {
    const id = blockElement.getAttribute("data-node-id");
    if (!id) return;
    let kernelDom = await this.getBlockDomFromKernel(id);
    const currentEditable = blockElement.querySelector('[contenteditable="true"]') as HTMLElement | null;
    if (currentEditable) {
      try {
        if (!kernelDom) kernelDom = blockElement.outerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(kernelDom, "text/html");
        const node = doc.body.firstElementChild as HTMLElement | null;
        if (node) {
          const editable = node.querySelector('[contenteditable="true"]') as HTMLElement | null;
          if (editable) editable.innerHTML = currentEditable.innerHTML;
          await this.updateBlockDom(id, node.outerHTML);
        } else {
          await this.updateBlockDom(id, blockElement.outerHTML);
        }
      } catch {
        await this.updateBlockDom(id, blockElement.outerHTML);
      }
    } else {
      await this.updateBlockDom(id, kernelDom || blockElement.outerHTML);
    }
    await this.flushTransaction();
  }

  private async getBlockDomFromKernel(id: string): Promise<string | null> {
    try {
      const res: any = await fetchSyncPost("/api/block/getBlockDOM", { id });
      return res?.data?.dom ?? res?.dom ?? null;
    } catch {
      return null;
    }
  }

  private async updateBlockDom(id: string, dom: string): Promise<void> {
    await fetchSyncPost("/api/block/updateBlock", { dataType: "dom", data: dom, id });
  }

  private async flushTransaction(): Promise<void> {
    try {
      await fetchSyncPost("/api/sqlite/flushTransaction", {});
    } catch {}
  }

  private setupDockPanel() {
    if (this.dockInited) return;
    this.addDock({
      config: { position: "LeftBottom", size: { width: 300, height: 400 }, icon: "iconEdit", title: "快捷键变色面板", hotkey: "⌥⌘C" },
      data: { shortcuts: this.shortcuts },
      type: "shortcut_color_dock",
      init: (dock: any) => {
        this.renderDockContent(dock);
      },
      resize() {},
      update() {},
      destroy() {}
    });
    this.dockInited = true;
  }

  private renderDockContent(dock: any) {
    this.refreshHotkeysFromSystem();
    const shortcuts = this.shortcuts;
    if (this.isMobile) {
      dock.element.innerHTML = `
        <div class="toolbar toolbar--border toolbar--dark">
          <svg class="toolbar__icon"><use xlink:href="#iconEdit"></use></svg>
          <div class="toolbar__text">快捷键变色面板</div>
        </div>
        <div class="fn__flex-1 shortcut-color-dock-mobile">
          ${this.renderShortcutButtons(shortcuts)}
        </div>
      `;
    } else {
      dock.element.innerHTML = `
        <div class="fn__flex-1 fn__flex-column">
          <div class="block__icons">
            <div class="block__logo">
              <svg class="block__logoicon"><use xlink:href="#iconEdit"></use></svg>
              快捷键变色面板
            </div>
            <span class="fn__flex-1 fn__space"></span>
            <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${adaptHotkey("⌘W")}">
              <svg><use xlink:href="#iconMin"></use></svg>
            </span>
          </div>
          <div class="fn__flex-1 shortcut-color-dock">
            ${this.renderShortcutButtons(shortcuts)}
          </div>
        </div>
      `;
    }
    this.bindDockEvents(dock.element);
  }

  private renderShortcutButtons(shortcuts: ColorShortcut[]): string {
    return `
      <div class="shortcut-buttons-container">
        <div class="shortcut-buttons-header">
          <h3>可用快捷键</h3>
          <button class="b3-button b3-button--outline add-new-shortcut">
            <svg><use xlink:href="#iconAdd"></use></svg>
            添加新的
          </button>
        </div>
        <div class="shortcut-buttons-list">
          ${shortcuts
            .map(
              sc => `
            <div class="shortcut-button-item" data-color="${sc.color}">
              <button class="b3-button shortcut-apply-btn" style="border-left:4px solid ${sc.color};">
                <span class="shortcut-name">${sc.name}</span>
                <span class="shortcut-hotkey">${sc.hotkey}</span>
              </button>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  private bindDockEvents(element: HTMLElement) {
    element.querySelectorAll(".shortcut-apply-btn").forEach((button, index) => {
      button.addEventListener("click", async () => {
        const shortcut = this.shortcuts[index];
        await this.applyColorFormat(shortcut.color, shortcut.bold, shortcut.italic);
      });
    });
    element.querySelector(".add-new-shortcut")?.addEventListener("click", () => {
      this.openShortcutEditDialog();
    });
  }

  private openShortcutEditDialog() {
    const dialog = new Dialog({
      title: "添加新快捷键",
      content: `
        <div class="b3-dialog__content">
          <div class="fn__flex-column">
            <div class="fn__flex" style="margin-bottom:12px;">
              <label class="fn__flex-center" style="width:80px;">名称:</label>
              <input class="b3-text-field fn__flex-1" id="shortcut-name" placeholder="请输入快捷键名称">
            </div>
            <div class="fn__flex" style="margin-bottom:12px;">
              <label class="fn__flex-center" style="width:80px;">快捷键:</label>
              <input class="b3-text-field fn__flex-1" id="shortcut-hotkey" placeholder="例如: ⌃R 或 Ctrl+R">
            </div>
            <div class="fn__flex" style="margin-bottom:12px%;">
              <label class="fn__flex-center" style="width:80px;">颜色:</label>
              <input type="color" class="fn__flex-1" id="shortcut-color" value="#000000" style="height:32px;">
            </div>
            <div class="shortcut-input-group" style="margin-bottom:12px;">
              <div class="fn__flex" style="margin-bottom:8px;">
                <label class="fn__flex-center" style="width:80px;">加粗:</label>
                <input type="checkbox" id="shortcut-bold" checked class="format-checkbox">
              </div>
              <div class="fn__flex">
                <label class="fn__flex-center" style="width:80px;">斜体:</label>
                <input type="checkbox" id="shortcut-italic" class="format-checkbox">
              </div>
            </div>
          </div>
        </div>
        <div class="b3-dialog__action">
          <button class="b3-button b3-button--cancel">取消</button>
          <div class="fn__space"></div>
          <button class="b3-button b3-button--text">保存</button>
        </div>
      `,
      width: this.isMobile ? "92vw" : "420px"
    });

    const nameInput = dialog.element.querySelector("#shortcut-name") as HTMLInputElement;
    const hotkeyInput = dialog.element.querySelector("#shortcut-hotkey") as HTMLInputElement;
    const colorInput = dialog.element.querySelector("#shortcut-color") as HTMLInputElement;
    const boldInput = dialog.element.querySelector("#shortcut-bold") as HTMLInputElement;
    const italicInput = dialog.element.querySelector("#shortcut-italic") as HTMLInputElement;
    const buttons = dialog.element.querySelectorAll(".b3-button");

    nameInput.focus();
    buttons[0].addEventListener("click", () => dialog.destroy());
    buttons[1].addEventListener("click", () => {
      if (!nameInput.value.trim()) return showMessage("请输入快捷键名称");
      if (!hotkeyInput.value.trim()) return showMessage("请输入快捷键");
      const newShortcut: ColorShortcut = {
        id: `custom_${Date.now()}`,
        name: nameInput.value.trim(),
        hotkey: hotkeyInput.value.trim(),
        color: colorInput.value,
        bold: boldInput.checked,
        italic: italicInput.checked
      };
      this.shortcuts.push(newShortcut);
      const config: PluginConfig = { shortcuts: this.shortcuts, showNotification: this.showNotification, convertHotkey: this.convertHotkey };
      this.saveData(STORAGE_NAME, config);
      this.syncCommands();
      showMessage("快捷键已添加");
      dialog.destroy();
    });
  }
}