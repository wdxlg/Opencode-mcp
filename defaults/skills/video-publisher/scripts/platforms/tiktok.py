import time
from typing import Dict, Any
from playwright.sync_api import Page
from .base import format_hashtags, try_type_contenteditable, try_click_first, set_file_on_first_input

UPLOAD_URL = "https://www.tiktok.com/tiktokstudio/upload"


def publish_tiktok(page: Page, item: Dict[str, Any]) -> Dict[str, Any]:
    page.goto(UPLOAD_URL, wait_until="domcontentloaded", timeout=60000)
    time.sleep(4)
    if "login" in page.url.lower():
        return {"platform": "tiktok", "status": "need_login", "url": page.url, "message": "TikTok 未登录，请先运行 vpub login tiktok"}

    ok = set_file_on_first_input(
        page,
        [
            "input[type='file'][accept*='video']",
            "input[type='file']",
        ],
        item["video"],
    )
    if not ok:
        return {"platform": "tiktok", "status": "error", "message": "未找到 TikTok Studio 视频上传 input[type=file]"}

    time.sleep(5)
    title = item.get("title", "")
    desc = item.get("desc", "")
    tags_str = format_hashtags(item.get("tags", []))
    caption = f"{title} {desc} {tags_str}".strip()[:2200]

    try:
        editor = page.locator("div.public-DraftEditor-content[contenteditable='true'], div[contenteditable='true']").first
        editor.wait_for(state="visible", timeout=8000)
        editor.click()
        page.keyboard.press("Control+A")
        page.keyboard.press("Backspace")
        page.keyboard.insert_text(caption)
    except Exception:
        try_type_contenteditable(page, ["div[contenteditable='true']"], caption)

    if item.get("mode", "review") == "auto":
        clicked = try_click_first(
            page,
            [
                "button[data-e2e='post_video_button']",
                "button:has-text('Post')",
                "button:has-text('发布')",
            ],
            timeout_ms=6000,
        )
        time.sleep(3)
        return {"platform": "tiktok", "status": "published" if clicked else "review_ready", "url": page.url}

    return {"platform": "tiktok", "status": "review_ready", "url": page.url, "message": "已填入 TikTok 视频与 Caption，等待人工点击 Post/发布"}
