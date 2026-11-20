import time
from typing import Dict, Any
from playwright.sync_api import Page
from .base import format_hashtags, try_fill_first, try_type_contenteditable, try_click_first, set_file_on_first_input

UPLOAD_URL = "https://creator.xiaohongshu.com/publish/publish"


def publish_xiaohongshu(page: Page, item: Dict[str, Any]) -> Dict[str, Any]:
    page.goto(UPLOAD_URL, wait_until="domcontentloaded", timeout=45000)
    time.sleep(3)
    if "login" in page.url.lower():
        return {"platform": "xiaohongshu", "status": "need_login", "url": page.url, "message": "小红书未登录，请先运行 vpub login xiaohongshu"}

    ok = set_file_on_first_input(
        page,
        [
            "input.upload-input[type='file']",
            "input[type='file'][accept*='mp4']",
            "input[type='file']",
        ],
        item["video"],
    )
    if not ok:
        return {"platform": "xiaohongshu", "status": "error", "message": "未找到小红书视频上传 input[type=file]"}

    time.sleep(5)
    title = item.get("title", "")[:20]
    desc = item.get("desc", "")
    tags_str = format_hashtags(item.get("tags", []))
    full_desc = f"{desc}\n{tags_str}".strip()

    try_fill_first(
        page,
        [
            "input[placeholder*='填写标题']",
            "input.d-text",
            "input[placeholder*='标题']",
        ],
        title,
    )
    try_type_contenteditable(
        page,
        [
            "div.ql-editor[contenteditable='true']",
            "div#post-textarea[contenteditable='true']",
            "div[contenteditable='true']",
        ],
        full_desc,
    )

    for _ in range(60):
        if page.locator("text=重新上传").count() > 0 or page.locator("text=上传成功").count() > 0:
            break
        time.sleep(2)

    if item.get("mode", "review") == "auto":
        clicked = try_click_first(
            page,
            [
                "button.publishBtn:has-text('发布')",
                "button:has-text('发布')",
            ],
            timeout_ms=6000,
        )
        time.sleep(3)
        return {"platform": "xiaohongshu", "status": "published" if clicked else "review_ready", "url": page.url}

    return {"platform": "xiaohongshu", "status": "review_ready", "url": page.url, "message": "已填入小红书视频与文案，等待人工点击发布"}
