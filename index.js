/*!
 * MIT License
 *
 * Copyright (c) 2023 SiYuan 思源笔记
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */(()=>{"use strict";var i={};i.d=(a,t)=>{for(var e in t)i.o(t,e)&&!i.o(a,e)&&Object.defineProperty(a,e,{enumerable:!0,get:t[e]})},i.o=(a,t)=>Object.prototype.hasOwnProperty.call(a,t),i.r=a=>{typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(a,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(a,"__esModule",{value:!0})};var p={};i.r(p),i.d(p,{default:()=>v});const r=require("siyuan"),h="shortcut-color-config";class v extends r.Plugin{constructor(){super(...arguments),this.shortcuts=[]}onload(){const t=(0,r.getFrontend)();this.isMobile=t==="mobile"||t==="browser-mobile",this.initializeDefaultData(),this.loadData(h),this.setupSettings(),this.registerShortcuts(),this.setupDockPanel(),console.log("\u5FEB\u6377\u952E\u53D8\u8272\u63D2\u4EF6\u5DF2\u52A0\u8F7D\uFF01")}onLayoutReady(){}onunload(){console.log("\u518D\u89C1\uFF0C\u5FEB\u6377\u952E\u53D8\u8272\u63D2\u4EF6\uFF01")}initializeDefaultData(){const t=[{id:"red",hotkey:"\u2303R",color:"#ff0000",name:"\u7EA2\u8272\u52A0\u7C97",bold:!0},{id:"blue",hotkey:"\u2303B",color:"#0066cc",name:"\u84DD\u8272\u52A0\u7C97",bold:!0},{id:"orange",hotkey:"\u2303O",color:"#ff9900",name:"\u6A59\u8272\u52A0\u7C97",bold:!0},{id:"purple",hotkey:"\u2303P",color:"#9966cc",name:"\u7D2B\u8272\u52A0\u7C97",bold:!0},{id:"black",hotkey:"\u2303K",color:"#000000",name:"\u9ED1\u8272\u6587\u672C",bold:!1}];this.data[h]?this.shortcuts=this.data[h].shortcuts||t:(this.data[h]={shortcuts:t},this.shortcuts=t)}setupSettings(){const t=this;this.setting=new r.Setting({confirmCallback:()=>{t.saveData(h,{shortcuts:t.shortcuts}),t.registerShortcuts(),(0,r.showMessage)("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58")}}),this.setting.addItem({title:"\u5FEB\u6377\u952E\u8BBE\u7F6E",description:"\u914D\u7F6E\u81EA\u5B9A\u4E49\u5FEB\u6377\u952E\u548C\u989C\u8272",createActionElement:()=>{const e=document.createElement("div");return e.className="shortcut-color-settings",t.renderShortcutSettings(e),e}})}renderShortcutSettings(t){const e=this;t.innerHTML=`
            <div class="shortcut-color-list">
                ${this.shortcuts.map((o,n)=>`
                    <div class="shortcut-color-item" data-index="${n}">
                        <div class="shortcut-item-header">
                            <h4 class="shortcut-item-title">${o.name||"\u65B0\u5FEB\u6377\u952E"}</h4>
                            <button class="b3-button b3-button--cancel remove-shortcut" title="\u5220\u9664">\xD7</button>
                        </div>
                        <div class="shortcut-item-content">
                            <div class="shortcut-input-group">
                                <label>\u540D\u79F0:</label>
                                <input type="text" class="b3-text-field shortcut-name" value="${o.name}" placeholder="\u8BF7\u8F93\u5165\u5FEB\u6377\u952E\u540D\u79F0">
                            </div>
                            <div class="shortcut-input-group">
                                <label>\u5FEB\u6377\u952E:</label>
                                <input type="text" class="b3-text-field shortcut-hotkey" value="${o.hotkey}" placeholder="\u70B9\u51FB\u540E\u6309\u4E0B\u5FEB\u6377\u952E" readonly>
                            </div>
                            <div class="shortcut-input-group">
                                <label>\u989C\u8272:</label>
                                <input type="color" class="shortcut-color" value="${o.color}">
                            </div>
                            <div class="shortcut-input-group">
                                <label>\u52A0\u7C97:</label>
                                <input type="checkbox" class="shortcut-bold" ${o.bold?"checked":""}>
                            </div>
                        </div>
                    </div>
                `).join("")}
                <div class="shortcut-color-item add-shortcut-item">
                    <button class="b3-button b3-button--outline add-shortcut">
                        <span class="add-icon">+</span>
                        <span class="add-text">\u6DFB\u52A0\u5FEB\u6377\u952E</span>
                    </button>
                </div>
            </div>
        `,this.bindSettingsEvents(t)}bindSettingsEvents(t){const e=this,o=t.querySelector(".add-shortcut");o?.addEventListener("click",()=>{const n={id:`custom_${Date.now()}`,hotkey:"",color:"#000000",name:"\u65B0\u5FEB\u6377\u952E",bold:!0};e.shortcuts.push(n),e.renderShortcutSettings(t)}),t.querySelectorAll(".remove-shortcut").forEach((n,c)=>{n.addEventListener("click",()=>{e.shortcuts.splice(c,1),e.renderShortcutSettings(t)})}),t.querySelectorAll(".shortcut-color-item").forEach((n,c)=>{const u=n.querySelector(".shortcut-name"),s=n.querySelector(".shortcut-hotkey"),l=n.querySelector(".shortcut-color"),d=n.querySelector(".shortcut-bold");u?.addEventListener("input",()=>{e.shortcuts[c].name=u.value;const E=n.querySelector(".shortcut-item-title");E&&(E.textContent=u.value||"\u65B0\u5FEB\u6377\u952E")}),l?.addEventListener("input",()=>{e.shortcuts[c].color=l.value}),d?.addEventListener("change",()=>{e.shortcuts[c].bold=d.checked}),s?.addEventListener("click",()=>{e.startHotkeyCapture(s,c)}),s?.addEventListener("focus",()=>{e.startHotkeyCapture(s,c)})})}startHotkeyCapture(t,e){const o=this;if(t.classList.contains("capturing"))return;t.placeholder="\u6309\u4E0B\u5FEB\u6377\u952E\u7EC4\u5408...",t.classList.add("capturing"),t.focus(),t.select();const n=u=>{u.preventDefault(),u.stopPropagation();const s=[];if(u.ctrlKey&&s.push("\u2303"),u.altKey&&s.push("\u2325"),u.shiftKey&&s.push("\u21E7"),u.metaKey&&s.push("\u2318"),u.key&&u.key!=="Meta"&&u.key!=="Control"&&u.key!=="Alt"&&u.key!=="Shift"){let l=u.key;switch(u.key){case" ":l="Space";break;case"ArrowUp":l="\u2191";break;case"ArrowDown":l="\u2193";break;case"ArrowLeft":l="\u2190";break;case"ArrowRight":l="\u2192";break;case"Escape":l="Esc";break;case"Delete":l="Del";break;case"Backspace":l="\u232B";break;case"Enter":l="\u21B5";break;case"Tab":l="\u21E5";break;default:l=u.key.length===1?u.key.toUpperCase():l}s.push(l)}if(s.length>=2||s.length===1&&["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","Esc","\u232B","\u21B5","\u21E5"].includes(s[0])){const l=s.join("");t.value=l,o.shortcuts[e].hotkey=l,o.finishHotkeyCapture(t,n)}else u.key==="Escape"&&o.finishHotkeyCapture(t,n)},c=()=>{o.finishHotkeyCapture(t,n,c)};t.addEventListener("keydown",n),t.addEventListener("blur",c),setTimeout(()=>{t.classList.contains("capturing")&&o.finishHotkeyCapture(t,n,c)},1e4)}finishHotkeyCapture(t,e,o){t.placeholder="\u70B9\u51FB\u8BBE\u7F6E\u5FEB\u6377\u952E",t.classList.remove("capturing"),t.removeEventListener("keydown",e),o&&t.removeEventListener("blur",o),t.blur()}registerShortcuts(){const t=this;this.shortcuts.forEach(e=>{e.hotkey&&this.addCommand({langKey:e.id,langText:e.name,hotkey:e.hotkey,callback:()=>{t.applyColorFormat(e.color,e.bold)}})})}applyColorFormat(t,e=!0){const o=(0,r.getAllEditor)();if(o.length===0){(0,r.showMessage)("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u6587\u6863");return}if(!o[0].protyle){(0,r.showMessage)("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A\u6587\u6863");return}const u=window.getSelection();if(!u||u.rangeCount===0){(0,r.showMessage)("\u8BF7\u5148\u9009\u62E9\u8981\u683C\u5F0F\u5316\u7684\u6587\u672C");return}const s=u.getRangeAt(0);if(s.collapsed){(0,r.showMessage)("\u8BF7\u5148\u9009\u62E9\u8981\u683C\u5F0F\u5316\u7684\u6587\u672C");return}const l=s.toString();if(!l){(0,r.showMessage)("\u8BF7\u5148\u9009\u62E9\u8981\u683C\u5F0F\u5316\u7684\u6587\u672C");return}try{const d=e?`<strong style="color: ${t};">${l}</strong>`:`<span style="color: ${t};">${l}</span>`,b=(s.startContainer.nodeType===Node.TEXT_NODE?s.startContainer.parentElement:s.startContainer).closest("[data-node-id]");if(!b){(0,r.showMessage)("\u65E0\u6CD5\u627E\u5230\u5F53\u524D\u5757\u5143\u7D20");return}const f=b.getAttribute("data-node-id"),F=b.innerHTML;document.execCommand("insertHTML",!1,d);const y=new CustomEvent("input",{bubbles:!0});b.dispatchEvent(y),u.removeAllRanges(),(0,r.showMessage)(`\u5DF2\u5E94\u7528${e?"\u52A0\u7C97":""}\u989C\u8272\u683C\u5F0F: ${t}`)}catch(d){console.error("\u5E94\u7528\u683C\u5F0F\u65F6\u51FA\u9519:",d),(0,r.showMessage)("\u683C\u5F0F\u5E94\u7528\u5931\u8D25")}}setupDockPanel(){const t=this;this.addDock({config:{position:"LeftBottom",size:{width:300,height:400},icon:"iconEdit",title:"\u5FEB\u6377\u952E\u53D8\u8272\u9762\u677F",hotkey:"\u2325\u2318C"},data:{shortcuts:this.shortcuts},type:"shortcut_color_dock",init:e=>{t.renderDockContent(e)},resize(){console.log("shortcut_color_dock resize")},update(){console.log("shortcut_color_dock update")},destroy(){console.log("destroy dock: shortcut_color_dock")}})}renderDockContent(t){const e=this.shortcuts;this.isMobile?t.element.innerHTML=`
                <div class="toolbar toolbar--border toolbar--dark">
                    <svg class="toolbar__icon"><use xlink:href="#iconEdit"></use></svg>
                    <div class="toolbar__text">\u5FEB\u6377\u952E\u53D8\u8272\u9762\u677F</div>
                </div>
                <div class="fn__flex-1 shortcut-color-dock-mobile">
                    ${this.renderShortcutButtons(e)}
                </div>
            `:t.element.innerHTML=`
                <div class="fn__flex-1 fn__flex-column">
                    <div class="block__icons">
                        <div class="block__logo">
                            <svg class="block__logoicon"><use xlink:href="#iconEdit"></use></svg>
                            \u5FEB\u6377\u952E\u53D8\u8272\u9762\u677F
                        </div>
                        <span class="fn__flex-1 fn__space"></span>
                        <span data-type="min" class="block__icon b3-tooltips b3-tooltips__sw" aria-label="Min ${(0,r.adaptHotkey)("\u2318W")}">
                            <svg><use xlink:href="#iconMin"></use></svg>
                        </span>
                    </div>
                    <div class="fn__flex-1 shortcut-color-dock">
                        ${this.renderShortcutButtons(e)}
                    </div>
                </div>
            `,this.bindDockEvents(t.element)}renderShortcutButtons(t){return`
            <div class="shortcut-buttons-container">
                <div class="shortcut-buttons-header">
                    <h3>\u53EF\u7528\u5FEB\u6377\u952E</h3>
                    <button class="b3-button b3-button--outline add-new-shortcut">
                        <svg><use xlink:href="#iconAdd"></use></svg>
                        \u6DFB\u52A0\u65B0\u7684
                    </button>
                </div>
                <div class="shortcut-buttons-list">
                    ${t.map(e=>`
                        <div class="shortcut-button-item" data-color="${e.color}">
                            <button class="b3-button shortcut-apply-btn" style="border-left: 4px solid ${e.color};">
                                <span class="shortcut-name">${e.name}</span>
                                <span class="shortcut-hotkey">${e.hotkey}</span>
                            </button>
                        </div>
                    `).join("")}
                </div>
            </div>
        `}bindDockEvents(t){const e=this;t.querySelectorAll(".shortcut-apply-btn").forEach((n,c)=>{n.addEventListener("click",()=>{const u=e.shortcuts[c];e.applyColorFormat(u.color,u.bold)})});const o=t.querySelector(".add-new-shortcut");o?.addEventListener("click",()=>{e.openShortcutEditDialog()})}openShortcutEditDialog(){const t=this,e=new r.Dialog({title:"\u6DFB\u52A0\u65B0\u5FEB\u6377\u952E",content:`
                <div class="b3-dialog__content">
                    <div class="fn__flex-column">
                        <div class="fn__flex" style="margin-bottom: 12px;">
                            <label class="fn__flex-center" style="width: 80px;">\u540D\u79F0:</label>
                            <input class="b3-text-field fn__flex-1" id="shortcut-name" placeholder="\u8BF7\u8F93\u5165\u5FEB\u6377\u952E\u540D\u79F0">
                        </div>
                        <div class="fn__flex" style="margin-bottom: 12px;">
                            <label class="fn__flex-center" style="width: 80px;">\u5FEB\u6377\u952E:</label>
                            <input class="b3-text-field fn__flex-1" id="shortcut-hotkey" placeholder="\u4F8B\u5982: \u2303R \u6216 Ctrl+R">
                        </div>
                        <div class="fn__flex" style="margin-bottom: 12px;">
                            <label class="fn__flex-center" style="width: 80px;">\u989C\u8272:</label>
                            <input type="color" class="fn__flex-1" id="shortcut-color" value="#000000" style="height: 32px;">
                        </div>
                    </div>
                </div>
                <div class="b3-dialog__action">
                    <button class="b3-button b3-button--cancel">\u53D6\u6D88</button>
                    <div class="fn__space"></div>
                    <button class="b3-button b3-button--text">\u4FDD\u5B58</button>
                </div>
            `,width:this.isMobile?"92vw":"420px"}),o=e.element.querySelector("#shortcut-name"),n=e.element.querySelector("#shortcut-hotkey"),c=e.element.querySelector("#shortcut-color"),u=e.element.querySelectorAll(".b3-button");o.focus(),u[0].addEventListener("click",()=>{e.destroy()}),u[1].addEventListener("click",()=>{if(!o.value.trim()){(0,r.showMessage)("\u8BF7\u8F93\u5165\u5FEB\u6377\u952E\u540D\u79F0");return}if(!n.value.trim()){(0,r.showMessage)("\u8BF7\u8F93\u5165\u5FEB\u6377\u952E");return}const s={id:`custom_${Date.now()}`,name:o.value.trim(),hotkey:n.value.trim(),color:c.value,bold:!0};t.shortcuts.push(s),t.saveData(h,{shortcuts:t.shortcuts}),t.registerShortcuts(),(0,r.showMessage)("\u5FEB\u6377\u952E\u5DF2\u6DFB\u52A0"),e.destroy()})}}module.exports=p})();
