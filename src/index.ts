import {
    Plugin,
    showMessage,
    Dialog,
    Setting,
    adaptHotkey,
    getFrontend,
    getAllEditor
} from "siyuan";
import "./index.scss";

const STORAGE_NAME = "shortcut-color-config";

interface ColorShortcut {
    id: string;
    hotkey: string;
    color: string;
    name: string;
    bold: boolean;
}

export default class ShortcutColorPlugin extends Plugin {
    private isMobile: boolean;
    private shortcuts: ColorShortcut[] = [];

    onload() {
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
        
        // 初始化默认数据
        this.initializeDefaultData();
        
        // 加载数据
        this.loadData(STORAGE_NAME);
        
        // 添加设置面板
        this.setupSettings();
        
        // 注册快捷键
        this.registerShortcuts();
        
        // 添加Dock面板
        this.setupDockPanel();
        
        console.log("快捷键变色插件已加载！");
    }

    onLayoutReady() {
        // 插件加载完成后的处理
    }

    onunload() {
        console.log("再见，快捷键变色插件！");
    }

    private initializeDefaultData() {
        // 设置默认的快捷键配置
        const defaultShortcuts: ColorShortcut[] = [
            { id: "red", hotkey: "⌃R", color: "#ff0000", name: "红色加粗", bold: true },
            { id: "blue", hotkey: "⌃B", color: "#0066cc", name: "蓝色加粗", bold: true },
            { id: "orange", hotkey: "⌃O", color: "#ff9900", name: "橙色加粗", bold: true },
            { id: "purple", hotkey: "⌃P", color: "#9966cc", name: "紫色加粗", bold: true },
            { id: "black", hotkey: "⌃K", color: "#000000", name: "黑色文本", bold: false }
        ];

        if (!this.data[STORAGE_NAME]) {
            this.data[STORAGE_NAME] = { shortcuts: defaultShortcuts };
            this.shortcuts = defaultShortcuts;
        } else {
            this.shortcuts = this.data[STORAGE_NAME].shortcuts || defaultShortcuts;
        }
    }

    private setupSettings() {
        const plugin = this;
        this.setting = new Setting({
            confirmCallback: () => {
                plugin.saveData(STORAGE_NAME, { shortcuts: plugin.shortcuts });
                plugin.registerShortcuts();
                showMessage("设置已保存");
            }
        });

        this.setting.addItem({
            title: "快捷键设置",
            description: "配置自定义快捷键和颜色",
            createActionElement: () => {
                const container = document.createElement("div");
                container.className = "shortcut-color-settings";
                plugin.renderShortcutSettings(container);
                return container;
            }
        });
    }

    private renderShortcutSettings(container: HTMLElement) {
        const plugin = this;
        container.innerHTML = `
            <div class="shortcut-color-list">
                ${this.shortcuts.map((shortcut, index) => `
                    <div class="shortcut-color-item" data-index="${index}">
                        <div class="shortcut-item-header">
                            <h4 class="shortcut-item-title">${shortcut.name || '新快捷键'}</h4>
                            <button class="b3-button b3-button--cancel remove-shortcut" title="删除">×</button>
                        </div>
                        <div class="shortcut-item-content">
                            <div class="shortcut-input-group">
                                <label>名称:</label>
                                <input type="text" class="b3-text-field shortcut-name" value="${shortcut.name}" placeholder="请输入快捷键名称">
                            </div>
                            <div class="shortcut-input-group">
                                <label>快捷键:</label>
                                <input type="text" class="b3-text-field shortcut-hotkey" value="${shortcut.hotkey}" placeholder="点击后按下快捷键" readonly>
                            </div>
                            <div class="shortcut-input-group">
                                <label>颜色:</label>
                                <input type="color" class="shortcut-color" value="${shortcut.color}">
                            </div>
                            <div class="shortcut-input-group">
                                <label>加粗:</label>
                                <input type="checkbox" class="shortcut-bold" ${shortcut.bold ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="shortcut-color-item add-shortcut-item">
                    <button class="b3-button b3-button--outline add-shortcut">
                        <span class="add-icon">+</span>
                        <span class="add-text">添加快捷键</span>
                    </button>
                </div>
            </div>
        `;

        this.bindSettingsEvents(container);
    }

    private bindSettingsEvents(container: HTMLElement) {
        const plugin = this;
        
        // 添加新快捷键
        const addButton = container.querySelector('.add-shortcut') as HTMLButtonElement;
        addButton?.addEventListener('click', () => {
            const newShortcut: ColorShortcut = {
                id: `custom_${Date.now()}`,
                hotkey: "",
                color: "#000000",
                name: "新快捷键",
                bold: true
            };
            plugin.shortcuts.push(newShortcut);
            plugin.renderShortcutSettings(container);
        });

        // 删除快捷键
        container.querySelectorAll('.remove-shortcut').forEach((button, index) => {
            button.addEventListener('click', () => {
                plugin.shortcuts.splice(index, 1);
                plugin.renderShortcutSettings(container);
            });
        });

        // 更新快捷键数据
        container.querySelectorAll('.shortcut-color-item').forEach((item, index) => {
            const nameInput = item.querySelector('.shortcut-name') as HTMLInputElement;
            const hotkeyInput = item.querySelector('.shortcut-hotkey') as HTMLInputElement;
            const colorInput = item.querySelector('.shortcut-color') as HTMLInputElement;
            const boldInput = item.querySelector('.shortcut-bold') as HTMLInputElement;

            // 名称更新
            nameInput?.addEventListener('input', () => {
                plugin.shortcuts[index].name = nameInput.value;
                // 更新标题显示
                const titleElement = item.querySelector('.shortcut-item-title');
                if (titleElement) {
                    titleElement.textContent = nameInput.value || '新快捷键';
                }
            });

            // 颜色更新
            colorInput?.addEventListener('input', () => {
                plugin.shortcuts[index].color = colorInput.value;
            });

            // 加粗选项更新
            boldInput?.addEventListener('change', () => {
                plugin.shortcuts[index].bold = boldInput.checked;
            });

            // 快捷键捕获 - 点击输入框触发
            hotkeyInput?.addEventListener('click', () => {
                plugin.startHotkeyCapture(hotkeyInput, index);
            });
            
            hotkeyInput?.addEventListener('focus', () => {
                plugin.startHotkeyCapture(hotkeyInput, index);
            });
        });
    }

    private startHotkeyCapture(input: HTMLInputElement, index: number) {
        const plugin = this;
        
        // 如果已经在捕获中，先清理
        if (input.classList.contains('capturing')) {
            return;
        }
        
        input.placeholder = "按下快捷键组合...";
        input.classList.add('capturing');
        input.focus();
        input.select();
        
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            const keys = [];
            
            // 修饰键 - 按照常见顺序排列
            if (e.ctrlKey) keys.push('⌃');
            if (e.altKey) keys.push('⌥');
            if (e.shiftKey) keys.push('⇧');
            if (e.metaKey) keys.push('⌘');
            
            // 主键 - 只有在有修饰键的情况下才添加主键
            if (e.key && e.key !== 'Meta' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift') {
                // 特殊键映射
                let keyName = e.key;
                switch (e.key) {
                    case ' ':
                        keyName = 'Space';
                        break;
                    case 'ArrowUp':
                        keyName = '↑';
                        break;
                    case 'ArrowDown':
                        keyName = '↓';
                        break;
                    case 'ArrowLeft':
                        keyName = '←';
                        break;
                    case 'ArrowRight':
                        keyName = '→';
                        break;
                    case 'Escape':
                        keyName = 'Esc';
                        break;
                    case 'Delete':
                        keyName = 'Del';
                        break;
                    case 'Backspace':
                        keyName = '⌫';
                        break;
                    case 'Enter':
                        keyName = '↵';
                        break;
                    case 'Tab':
                        keyName = '⇥';
                        break;
                    default:
                        keyName = e.key.length === 1 ? e.key.toUpperCase() : keyName;
                }
                keys.push(keyName);
            }
            
            // 至少需要一个修饰键和一个主键，或者是功能键
            if (keys.length >= 2 || (keys.length === 1 && ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Esc', '⌫', '↵', '⇥'].includes(keys[0]))) {
                const hotkey = keys.join('');
                input.value = hotkey;
                plugin.shortcuts[index].hotkey = hotkey;
                
                // 清理
                plugin.finishHotkeyCapture(input, handleKeyDown);
            } else if (e.key === 'Escape') {
                // ESC 取消捕获
                plugin.finishHotkeyCapture(input, handleKeyDown);
            }
        };
        
        const handleBlur = () => {
            // 失去焦点时取消捕获
            plugin.finishHotkeyCapture(input, handleKeyDown, handleBlur);
        };
        
        input.addEventListener('keydown', handleKeyDown);
        input.addEventListener('blur', handleBlur);
        
        // 10秒后自动取消捕获
        setTimeout(() => {
            if (input.classList.contains('capturing')) {
                plugin.finishHotkeyCapture(input, handleKeyDown, handleBlur);
            }
        }, 10000);
    }
    
    private finishHotkeyCapture(input: HTMLInputElement, keydownHandler: (e: KeyboardEvent) => void, blurHandler?: () => void) {
        input.placeholder = "点击设置快捷键";
        input.classList.remove('capturing');
        input.removeEventListener('keydown', keydownHandler);
        if (blurHandler) {
            input.removeEventListener('blur', blurHandler);
        }
        input.blur();
    }

    private registerShortcuts() {
        const plugin = this;
        
        this.shortcuts.forEach(shortcut => {
            if (shortcut.hotkey) {
                this.addCommand({
                    langKey: shortcut.id,
                    langText: shortcut.name,
                    hotkey: shortcut.hotkey,
                    callback: () => {
                        plugin.applyColorFormat(shortcut.color, shortcut.bold);
                    }
                });
            }
        });
    }

    private applyColorFormat(color: string, bold: boolean = true) {
        const editors = getAllEditor();
        if (editors.length === 0) {
            showMessage("请先打开一个文档");
            return;
        }

        const editor = editors[0];
        const protyle = editor.protyle;
        
        if (!protyle) {
            showMessage("请先打开一个文档");
            return;
        }

        // 获取选中的文本
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            showMessage("请先选择要格式化的文本");
            return;
        }

        const range = selection.getRangeAt(0);
        if (range.collapsed) {
            showMessage("请先选择要格式化的文本");
            return;
        }

        // 获取选中的文本内容
        const selectedText = range.toString();
        if (!selectedText) {
            showMessage("请先选择要格式化的文本");
            return;
        }

        // 使用思源笔记的格式化方式，确保可以撤销
        try {
            // 创建格式化的HTML
            const formattedHTML = bold 
                ? `<strong style="color: ${color};">${selectedText}</strong>`
                : `<span style="color: ${color};">${selectedText}</span>`;
            
            // 获取当前焦点的块元素
            const focusElement = range.startContainer.nodeType === Node.TEXT_NODE 
                ? range.startContainer.parentElement 
                : range.startContainer as Element;
            
            const blockElement = focusElement.closest('[data-node-id]') as HTMLElement;
            if (!blockElement) {
                showMessage("无法找到当前块元素");
                return;
            }

            // 记录当前状态用于撤销
            const blockId = blockElement.getAttribute('data-node-id');
            const originalHTML = blockElement.innerHTML;
            
            // 执行替换
            document.execCommand('insertHTML', false, formattedHTML);
            
            // 触发思源的更新事件
            const updateEvent = new CustomEvent('input', { bubbles: true });
            blockElement.dispatchEvent(updateEvent);
            
            // 清除选择
            selection.removeAllRanges();
            
            showMessage(`已应用${bold ? '加粗' : ''}颜色格式: ${color}`);
            
        } catch (error) {
            console.error('应用格式时出错:', error);
            showMessage("格式应用失败");
        }
    }

    private setupDockPanel() {
        const plugin = this;
        
        this.addDock({
            config: {
                position: "LeftBottom",
                size: {width: 300, height: 400},
                icon: "iconEdit",
                title: "快捷键变色面板",
                hotkey: "⌥⌘C",
            },
            data: {
                shortcuts: this.shortcuts
            },
            type: "shortcut_color_dock",
            init: (dock: any) => {
                plugin.renderDockContent(dock);
            },
            resize() {
                console.log("shortcut_color_dock resize");
            },
            update() {
                console.log("shortcut_color_dock update");
            },
            destroy() {
                console.log("destroy dock: shortcut_color_dock");
            }
        });
    }

    private renderDockContent(dock: any) {
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
                    ${shortcuts.map(shortcut => `
                        <div class="shortcut-button-item" data-color="${shortcut.color}">
                            <button class="b3-button shortcut-apply-btn" style="border-left: 4px solid ${shortcut.color};">
                                <span class="shortcut-name">${shortcut.name}</span>
                                <span class="shortcut-hotkey">${shortcut.hotkey}</span>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    private bindDockEvents(element: HTMLElement) {
        const plugin = this;
        
        // 绑定快捷键按钮点击事件
        element.querySelectorAll('.shortcut-apply-btn').forEach((button, index) => {
            button.addEventListener('click', () => {
                const shortcut = plugin.shortcuts[index];
                plugin.applyColorFormat(shortcut.color, shortcut.bold);
            });
        });

        // 绑定添加新快捷键按钮
        const addButton = element.querySelector('.add-new-shortcut');
        addButton?.addEventListener('click', () => {
            plugin.openShortcutEditDialog();
        });
    }

    private openShortcutEditDialog() {
        const plugin = this;
        
        const dialog = new Dialog({
            title: "添加新快捷键",
            content: `
                <div class="b3-dialog__content">
                    <div class="fn__flex-column">
                        <div class="fn__flex" style="margin-bottom: 12px;">
                            <label class="fn__flex-center" style="width: 80px;">名称:</label>
                            <input class="b3-text-field fn__flex-1" id="shortcut-name" placeholder="请输入快捷键名称">
                        </div>
                        <div class="fn__flex" style="margin-bottom: 12px;">
                            <label class="fn__flex-center" style="width: 80px;">快捷键:</label>
                            <input class="b3-text-field fn__flex-1" id="shortcut-hotkey" placeholder="例如: ⌃R 或 Ctrl+R">
                        </div>
                        <div class="fn__flex" style="margin-bottom: 12px;">
                            <label class="fn__flex-center" style="width: 80px;">颜色:</label>
                            <input type="color" class="fn__flex-1" id="shortcut-color" value="#000000" style="height: 32px;">
                        </div>
                    </div>
                </div>
                <div class="b3-dialog__action">
                    <button class="b3-button b3-button--cancel">取消</button>
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--text">保存</button>
                </div>
            `,
            width: this.isMobile ? "92vw" : "420px",
        });

        const nameInput = dialog.element.querySelector("#shortcut-name") as HTMLInputElement;
        const hotkeyInput = dialog.element.querySelector("#shortcut-hotkey") as HTMLInputElement;
        const colorInput = dialog.element.querySelector("#shortcut-color") as HTMLInputElement;
        const buttons = dialog.element.querySelectorAll(".b3-button");

        nameInput.focus();

        // 取消按钮
        buttons[0].addEventListener("click", () => {
            dialog.destroy();
        });

        // 保存按钮
        buttons[1].addEventListener("click", () => {
            if (!nameInput.value.trim()) {
                showMessage("请输入快捷键名称");
                return;
            }

            if (!hotkeyInput.value.trim()) {
                showMessage("请输入快捷键");
                return;
            }

            const newShortcut: ColorShortcut = {
                id: `custom_${Date.now()}`,
                name: nameInput.value.trim(),
                hotkey: hotkeyInput.value.trim(),
                color: colorInput.value,
                bold: true
            };

            plugin.shortcuts.push(newShortcut);
            plugin.saveData(STORAGE_NAME, { shortcuts: plugin.shortcuts });
            plugin.registerShortcuts();

            showMessage("快捷键已添加");
            dialog.destroy();
        });
    }
}