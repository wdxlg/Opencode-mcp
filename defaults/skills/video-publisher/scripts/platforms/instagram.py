import time
from typing import Dict, Any
from playwright.sync_api import Page
from .base import format_hashtags, try_type_contenteditable, try_click_first, set_file_on_first_input

UPLOAD_URL = "https://www.instagram.com/"


def publish_instagram(page: Page, item: Dict[str, Any]) -> Dict[str, Any]:
    page.goto(UPLOAD_URL, wait_until="domcontentloaded", timeout=60000)
    time.sleep(4)
    if "accounts/login" in page.url.lower() or page.locator("input[name='username']").count() > 0:
        return {"platform": "instagram", "status": "need_login", "url": page.url, "message": "Instagram 未登录，请先运行 vpub login instagram"}

    # 点击左侧 Create / 新帖子
    try_click_first(
        page,
        [
            "svg[aria-label='New post']",
            "svg[aria-label='新帖子']",
            "a:has-text('Create')",
            "span:has-text('Create')",
            "span:has-text('创建')",
        ],
        timeout_ms=6000,
    )
    time.sleep(1.5)
    try_click_first(
        page,
        [
            "span:has-text('Post')",
            "span:has-text('帖子')",
        ],
        timeout_ms=3000,
    )

    ok = set_file_on_first_input(page, ["input[type='file']"], item["video"])
    if not ok:
        return {"platform": "instagram", "status": "error", "message": "未找到 Instagram 视频上传 input[type=file]"}

    time.sleep(4)
    # 依次点击两次 Next / 下一步（裁剪 -> 封面/滤镜 -> 填写文案）
    for _ in range(2):
        try_click_first(
            page,
            [
                "div[role='button']:has-text('Next')",
                "div[role='button']:has-text('下一步')",
                "button:has-text('Next')",
            ],
            timeout_ms=5000,
        )
        time.sleep(2)

    title = item.get("title", "")
    desc = item.get("desc", "")
    tags_str = format_hashtags(item.get("tags", []))
    caption = f"{title}\n\n{desc}\n\n{tags_str}".strip()[:2200]

    try_type_contenteditable(
        page,
        [
            "div[aria-label*='Write a caption'][contenteditable='true']",
            "div[aria-label*='输入说明'][contenteditable='true']",
            "div[role='textbox'][contenteditable='true']",
        ],
        caption,
    )

    if item.get("mode", "review") == "auto":
        clicked = try_click_first(
            page,
            [
                "div[role='button']:has-text('Share')",
                "div[role='button']:has-text('分享')",
            ],
            timeout_ms=6000,
        )
        time.sleep(4)
        return {"platform": "instagram", "status": "published" if clicked else "review_ready", "url": page.url}

    return {"platform": "instagram", "status": "review_ready", "url": page.url, "message": "已填入 Instagram Reels 视频与文案，等待人工点击 Share/分享"}
