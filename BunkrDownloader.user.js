// ==UserScript==
// @name         Bunkr Downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Bunkr 下载器
// @author       GitHub Copilot
// @include      /^https:\/\/bunkr\.[^\/]+\/a\/.*$/
// @grant        none
// @run-at       document-end
// @noframes
// ==/UserScript==

(function () {
    "use strict";

    function main() {
        // 通过隐藏 iframe 加载页面并执行页面内 JS
        function loadPageInIframe(url, callback) {
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = function () {
                const doc = iframe.contentDocument;
                // 等待 video source 出现后再回调
                const checkVideo = () => {
                    const srcEl = doc.querySelector("video source");
                    if (srcEl) {
                        callback(doc);
                        document.body.removeChild(iframe);
                    } else {
                        setTimeout(checkVideo, 500);
                    }
                };
                checkVideo();
            };
        }

        function createPanel() {
            const panel = document.createElement("div");
            panel.id = "download-panel";
            Object.assign(panel.style, {
                position: "fixed",
                bottom: "10px",
                right: "10px",
                width: "200px",
                padding: "10px",
                backgroundColor: "white",
                color: "black",
                fontSize: "14px",
                zIndex: 10000,
                borderRadius: "5px",
            });
            const btn = document.createElement("button");
            btn.id = "start-download-btn";
            btn.textContent = "开始下载";
            btn.style.width = "100%";
            btn.style.marginBottom = "5px";
            panel.appendChild(btn);
            const progress = document.createElement("div");
            progress.id = "download-progress";
            progress.textContent = "0/0";
            panel.appendChild(progress);
            document.body.appendChild(panel);
            btn.addEventListener("click", startDownload);
        }
        async function startDownload() {
            const btn = document.getElementById("start-download-btn");
            btn.disabled = true;
            const links = document.querySelectorAll(
                ".mt-2.bg-black.bg-opacity-80.p-2.text-center.text-sm.rounded > a"
            );
            const total = links.length;
            const progressEl = document.getElementById("download-progress");
            progressEl.textContent = `0/${total}`;
            const videoUrls = [];
            let count = 0;
            for (const link of links) {
                await new Promise((resolve) => {
                    loadPageInIframe(link.href, (doc) => {
                        const videoSource = doc.querySelector("video source");
                        if (videoSource) {
                            console.debug(
                                "找到视频链接：",
                                videoSource.getAttribute("src")
                            );
                            videoUrls.push(videoSource.getAttribute("src"));
                        }
                        count++;
                        progressEl.textContent = `${count}/${total}`;
                        resolve();
                    });
                });
            }

            console.log("视频链接：", videoUrls);
            for (const url of videoUrls) {
                const a = document.createElement("a");
                a.href = url;
                a.download = "";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }
        createPanel();
    }

    // 立即执行 main（避免 window.load 事件已触发导致不执行）
    main();
})();
