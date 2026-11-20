import time
from typing import Dict, Any
from playwright.sync_api import Page
from .base import try_fill_first, try_type_contenteditable, try_click_first, set_file_on_first_input

UPLOAD_URL = "https://member.bilibili.com/platform/upload/video/frame"


def publish_bilibili(page: Page, item: Dict[str, Any]) -> Dict[str, Any]:
    page.goto(UPLOAD_URL, wait_until="domcontentloaded", timeout=45000)
    time.sleep(3)
    if "passport.bilibili.com" in page.url.lower() or "login" in page.url.lower():
        return {"platform": "bilibili", "status": "need_login", "url": page.url, "message": "Bilibili 未登录，请先运行 vpub login bilibili"}

    ok = set_file_on_first_input(
        page,
        [
            "input[type='file'][accept*='mp4']",
            "input[type='file']",
        ],
        item["video"],
    )
    if not ok:
        return {"platform": "bilibili", "status": "error", "message": "未找到 Bilibili 视频上传 input[type=file]"}

    time.sleep(5)
    title = item.get("title", "")[:80]
    desc = item.get("desc", "")
    tags = item.get("tags", [])[:10]

    try_fill_first(
        page,
        [
            "input[placeholder*='请输入稿件标题']",
            "input[placeholder*='标题']",
        ],
        title,
    )
    # 勾选“自制”
    try_click_first(page, ["span:has-text('自制')", "div.check-radio-v2-container:has-text('自制')"], timeout_ms=3000)

    # 填写标签（每个标签回车）
    for tag in tags:
        clean_tag = tag.strip().lstrip("#")
        if not clean_tag:
            continue
        try:
            tag_input = page.locator("input[placeholder*='按回车键Enter创建标签']").first
            if tag_input.is_visible(timeout=2000):
                tag_input.click()
                tag_input.fill(clean_tag)
                page.keyboard.press("Enter")
                time.sleep(0.3)
        except Exception:
            break

    try_type_contenteditable(
        page,
        [
            "div.ql-editor[contenteditable='true']",
            "textarea[placeholder*='填写更全面的相关信息']",
            "div[contenteditable='true']",
        ],
        desc,
    )

    for _ in range(60):
        if page.locator("text=上传完成").count() > 0 or page.locator("text=更换视频").count() > 0:
            break
        time.sleep(2)

    if item.get("mode", "review") == "auto":
        clicked = try_click_first(
            page,
            [
                "span.submit-add:has-text('立即投稿')",
                "button:has-text('立即投稿')",
            ],
            timeout_ms=6000,
        )
        time.sleep(3)
        return {"platform": "bilibili", "status": "published" if clicked else "review_ready", "url": page.url}

    return {"platform": "bilibili", "status": "review_ready", "url": page.url, "message": "已填入 Bilibili 视频、标题、标签与简介，等待人工点击立即投稿"}
