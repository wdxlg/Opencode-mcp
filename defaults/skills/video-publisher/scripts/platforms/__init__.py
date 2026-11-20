from .douyin import publish_douyin
from .kuaishou import publish_kuaishou
from .xiaohongshu import publish_xiaohongshu
from .bilibili import publish_bilibili
from .youtube import publish_youtube
from .tiktok import publish_tiktok
from .instagram import publish_instagram

PLATFORM_URLS = {
    "douyin": "https://creator.douyin.com/creator-micro/content/upload",
    "kuaishou": "https://cp.kuaishou.com/article/publish/video",
    "xiaohongshu": "https://creator.xiaohongshu.com/publish/publish",
    "bilibili": "https://member.bilibili.com/platform/upload/video/frame",
    "youtube": "https://studio.youtube.com",
    "tiktok": "https://www.tiktok.com/tiktokstudio/upload",
    "instagram": "https://www.instagram.com/"
}

PLATFORM_HANDLERS = {
    "douyin": publish_douyin,
    "kuaishou": publish_kuaishou,
    "xiaohongshu": publish_xiaohongshu,
    "bilibili": publish_bilibili,
    "youtube": publish_youtube,
    "tiktok": publish_tiktok,
    "instagram": publish_instagram,
}
