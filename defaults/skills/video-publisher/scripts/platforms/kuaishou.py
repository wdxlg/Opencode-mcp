import time
from typing import Dict, Any
from playwright.sync_api import Page
from .base import format_hashtags, try_type_contenteditable, try_click_first, set_file_on_first_input

UPLOAD_URL = "https://cp.kuaishou.com/article/publish/video"


def publish_kuaishou(page: Page, item: Dict[str, Any]) -> Dict[str, Any]:
    page.goto(UPLOAD_URL, wait_until="domcontentloaded", timeout=45000)
    time.sleep(3)
    if "passport.kuaishou.com" in page.url.lower() or "login" in page.url.lower():
        return {"platform": "kuaishou", "status": "need_login", "url": page.url, "message": "快手未登录，请先运行 vpub login kuaishou"}

    ok = set_file_on_first_input(
        page,
        [
            "input[type='file'][accept*='video']",
            "input[type='file']",
        ],
        item["video"],
    )
    if not ok:
        return {"platform": "kuaishou", "status": "error", "message": "未找到快手视频上传 input[type=file]"}

    time.sleep(5)
    title = item.get("title", "")
    desc = item.get("desc", "")
    tags_str = format_hashtags(item.get("tags", []))
    combined = f"{title}\n{desc} {tags_str}".strip()

    try_type_contenteditable(
        page,
        [
            "#work-description-edit",
            "div[placeholder*='作品描述']",
            "div[contenteditable='true']",
        ],
        combined,
    )

    for _ in range(60):
        if page.locator("text=上传成功").count() > 0 or page.locator("text=预览作品").count() > 0:
            break
        time.sleep(2)

    if item.get("mode", "review") == "auto":
        clicked = try_click_first(
            page,
            [
                "div[class*='button']:has-text('发布')",
                "button:has-text('发布')",
            ],
            timeout_ms=6000,
        )
        time.sleep(3)
        return {"platform": "kuaishou", "status": "published" if clicked else "review_ready", "url": page.url}

    return {"platform": "kuaishou", "status": "review_ready", "url": page.url, "message": "已填入快手视频与文案，等待人工点击发布"}
