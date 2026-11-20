import time
from typing import Dict, Any
from playwright.sync_api import Page
from .base import format_hashtags, try_fill_first, try_type_contenteditable, try_click_first, set_file_on_first_input

UPLOAD_URL = "https://creator.douyin.com/creator-micro/content/upload"


def publish_douyin(page: Page, item: Dict[str, Any]) -> Dict[str, Any]:
    page.goto(UPLOAD_URL, wait_until="domcontentloaded", timeout=45000)
    time.sleep(3)
    if "login" in page.url.lower() or page.locator("text=扫码登录").count() > 0:
        return {"platform": "douyin", "status": "need_login", "url": page.url, "message": "抖音未登录，请先运行 vpub login douyin"}

    video_path = item["video"]
    ok = set_file_on_first_input(
        page,
        [
            "input[type='file'][accept*='video']",
            "div[class*='upload'] input[type='file']",
            "input[type='file']",
        ],
        video_path,
    )
    if not ok:
        return {"platform": "douyin", "status": "error", "message": "未找到抖音视频上传 input[type=file]"}

    # Wait for form transition
    time.sleep(5)
    title = item.get("title", "")[:30]
    desc = item.get("desc", "")
    tags_str = format_hashtags(item.get("tags", []))
    full_desc = f"{desc} {tags_str}".strip()

    try_fill_first(
        page,
        [
            "input[placeholder*='填写作品标题']",
            "input[placeholder*='标题']",
            "div[class*='title'] input",
        ],
        title,
    )
    try_type_contenteditable(
        page,
        [
            "div.zone-container[contenteditable='true']",
            "div[contenteditable='true'][data-placeholder*='作品简介']",
            "div[contenteditable='true']",
        ],
        full_desc,
    )

    # Wait up to 120s for video upload completion indicator
    for _ in range(60):
        if page.locator("text=重新上传").count() > 0 or page.locator("text=上传成功").count() > 0:
            break
        time.sleep(2)

    if item.get("mode", "review") == "auto":
        clicked = try_click_first(
            page,
            [
                "button:has-text('发布')",
                "button[class*='primary']:has-text('发布')",
            ],
            timeout_ms=6000,
        )
        time.sleep(3)
        return {"platform": "douyin", "status": "published" if clicked else "review_ready", "url": page.url}

    return {"platform": "douyin", "status": "review_ready", "url": page.url, "message": "已填入抖音视频与文案，等待人工点击发布"}
