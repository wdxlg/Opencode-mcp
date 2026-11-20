import time
from typing import Dict, Any
from playwright.sync_api import Page
from .base import format_hashtags, try_click_first, set_file_on_first_input

UPLOAD_URL = "https://studio.youtube.com"


def publish_youtube(page: Page, item: Dict[str, Any]) -> Dict[str, Any]:
    page.goto(UPLOAD_URL, wait_until="domcontentloaded", timeout=60000)
    time.sleep(4)
    if "accounts.google.com" in page.url.lower():
        return {"platform": "youtube", "status": "need_login", "url": page.url, "message": "YouTube 未登录，请先运行 vpub login youtube"}

    # 点击右上角 Create -> Upload videos
    try_click_first(page, ["ytcp-button#create-icon", "#create-icon", "button[aria-label*='Create']", "button[aria-label*='创建']"], timeout_ms=5000)
    time.sleep(1)
    try_click_first(page, ["tp-yt-paper-item#text-item-0", "yt-formatted-string:has-text('Upload videos')", "yt-formatted-string:has-text('上传视频')"], timeout_ms=5000)
    time.sleep(2)

    ok = set_file_on_first_input(page, ["input[type='file']"], item["video"])
    if not ok:
        return {"platform": "youtube", "status": "error", "message": "未找到 YouTube Studio 视频上传 input[type=file]"}

    time.sleep(5)
    title = item.get("title", "")[:100]
    desc = item.get("desc", "")
    tags_str = format_hashtags(item.get("tags", []))
    full_desc = f"{desc}\n\n{tags_str}".strip()

    try:
        title_box = page.locator("#title-textarea #textbox").first
        title_box.wait_for(state="visible", timeout=8000)
        title_box.click()
        page.keyboard.press("Control+A")
        page.keyboard.insert_text(title)
    except Exception:
        pass

    try:
        desc_box = page.locator("#description-textarea #textbox").first
        desc_box.wait_for(state="visible", timeout=5000)
        desc_box.click()
        page.keyboard.insert_text(full_desc)
    except Exception:
        pass

    # Not made for kids
    try_click_first(page, ["tp-yt-paper-radio-button[name='VIDEO_MADE_FOR_KIDS_NOT_MFK']"], timeout_ms=4000)

    # Step through Next x 3 to Visibility
    for _ in range(3):
        try_click_first(page, ["ytcp-button#next-button", "#next-button"], timeout_ms=4000)
        time.sleep(1.5)

    visibility = item.get("visibility", "PUBLIC").upper()
    try_click_first(page, [f"tp-yt-paper-radio-button[name='{visibility}']", "tp-yt-paper-radio-button[name='PUBLIC']"], timeout_ms=4000)

    if item.get("mode", "review") == "auto":
        clicked = try_click_first(page, ["ytcp-button#done-button", "#done-button"], timeout_ms=6000)
        time.sleep(3)
        return {"platform": "youtube", "status": "published" if clicked else "review_ready", "url": page.url}

    return {"platform": "youtube", "status": "review_ready", "url": page.url, "message": "已填入 YouTube 视频、标题、描述与公开状态，等待人工点击发布"}
