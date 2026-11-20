#!/usr/bin/env python3
"""
info_cli.py - 多平台实时热榜聚合 + 指定平台关键词搜索 + 网页正文提取 CLI
参考开源项目设计：
  - TrendRadar (sansan0/TrendRadar)：多平台热榜聚合 + 三层关键词过滤 (+必含词 / !排除词 / 普通词)
  - MediaCrawler (NanmiCoder/MediaCrawler)：复用本机 Playwright/Edge 持久化会话在特定社交平台检索内容
  - content-trend-researcher：输出结构化 JSON 供 AI 做选题与信息汇总
"""
import argparse
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from typing import Dict, Any, List, Optional

sys.dont_write_bytecode = True
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def _resolve_runtime_dir() -> str:
    env_home = os.environ.get("VPUB_HOME")
    if env_home:
        return os.path.abspath(env_home)
    if os.path.isdir("E:/video-publisher"):
        return os.path.abspath("E:/video-publisher")
    candidate = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "..", "video-publisher"))
    os.makedirs(candidate, exist_ok=True)
    return candidate


ROOT_DIR = _resolve_runtime_dir()
CONFIG_PATH = (
    os.path.join(ROOT_DIR, "config.json")
    if os.path.isfile(os.path.join(ROOT_DIR, "config.json"))
    else os.path.join(SCRIPT_DIR, "config.json")
)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0"
)


def load_config() -> Dict[str, Any]:
    if os.path.isfile(CONFIG_PATH):
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def http_get_json(url: str, headers: Optional[Dict[str, str]] = None, proxy: str = "", timeout: int = 12) -> Any:
    hdrs = {"User-Agent": USER_AGENT, "Accept": "application/json, text/plain, */*"}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, headers=hdrs)
    handlers = []
    if proxy:
        handlers.append(urllib.request.ProxyHandler({"http": proxy, "https": proxy}))
    opener = urllib.request.build_opener(*handlers)
    with opener.open(req, timeout=timeout) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
        return json.loads(raw)


def http_get_text(url: str, headers: Optional[Dict[str, str]] = None, proxy: str = "", timeout: int = 12) -> str:
    hdrs = {"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, headers=hdrs)
    handlers = []
    if proxy:
        handlers.append(urllib.request.ProxyHandler({"http": proxy, "https": proxy}))
    opener = urllib.request.build_opener(*handlers)
    with opener.open(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


# ============================================================================
# 1. 多平台实时热榜获取（免登录直接拉取公开热榜接口）
# ============================================================================

def fetch_hot_bilibili(limit: int = 20) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    # 1) B站热搜词
    try:
        data = http_get_json(
            "https://app.bilibili.com/x/v2/search/trending/ranking?limit=30",
            headers={"Referer": "https://www.bilibili.com/"},
        )
        for idx, row in enumerate(data.get("data", {}).get("list", [])[:limit], 1):
            kw = row.get("keyword") or row.get("show_name") or ""
            if kw:
                items.append({
                    "rank": idx,
                    "title": kw,
                    "url": f"https://search.bilibili.com/all?keyword={urllib.parse.quote(kw)}",
                    "hot": row.get("heat_score", ""),
                    "type": "trending_keyword",
                })
        if items:
            return items
    except Exception:
        pass

    # 2) 备选：B站热门视频榜
    data = http_get_json(
        f"https://api.bilibili.com/x/web-interface/popular?ps={min(limit, 50)}&pn=1",
        headers={"Referer": "https://www.bilibili.com/"},
    )
    for idx, v in enumerate(data.get("data", {}).get("list", [])[:limit], 1):
        items.append({
            "rank": idx,
            "title": v.get("title", ""),
            "author": v.get("owner", {}).get("name", ""),
            "url": v.get("short_link_v2") or f"https://www.bilibili.com/video/{v.get('bvid', '')}",
            "views": v.get("stat", {}).get("view", 0),
            "likes": v.get("stat", {}).get("like", 0),
            "rcmd_reason": v.get("rcmd_reason", {}).get("content", ""),
            "type": "popular_video",
        })
    return items


def fetch_hot_weibo(limit: int = 20) -> List[Dict[str, Any]]:
    data = http_get_json(
        "https://weibo.com/ajax/side/hotSearch",
        headers={"Referer": "https://weibo.com/"},
    )
    realtime = data.get("data", {}).get("realtime", [])
    items = []
    for idx, row in enumerate(realtime[:limit], 1):
        word = row.get("word") or row.get("note") or ""
        items.append({
            "rank": idx,
            "title": word,
            "url": f"https://s.weibo.com/weibo?q={urllib.parse.quote('#' + word + '#')}",
            "hot": row.get("num", ""),
            "category": row.get("category", ""),
        })
    return items


def fetch_hot_douyin(limit: int = 20) -> List[Dict[str, Any]]:
    data = http_get_json(
        "https://www.iesdouyin.com/web/api/v2/hotsearch/billboard/word/",
        headers={"Referer": "https://www.douyin.com/"},
    )
    word_list = data.get("word_list", [])
    items = []
    for idx, row in enumerate(word_list[:limit], 1):
        word = row.get("word", "")
        items.append({
            "rank": idx,
            "title": word,
            "url": f"https://www.douyin.com/search/{urllib.parse.quote(word)}",
            "hot": row.get("hot_value", ""),
        })
    return items


def fetch_hot_baidu(limit: int = 20) -> List[Dict[str, Any]]:
    data = http_get_json("https://top.baidu.com/api/board?platform=wise&tab=realtime")
    cards = data.get("data", {}).get("cards", [])
    content = cards[0].get("content", []) if cards else []
    items = []
    for idx, row in enumerate(content[:limit], 1):
        word = row.get("word") or row.get("query") or ""
        items.append({
            "rank": idx,
            "title": word,
            "desc": row.get("desc", ""),
            "url": row.get("url") or f"https://www.baidu.com/s?wd={urllib.parse.quote(word)}",
            "hot": row.get("hotScore", ""),
        })
    return items


def fetch_hot_toutiao(limit: int = 20) -> List[Dict[str, Any]]:
    data = http_get_json("https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc")
    rows = data.get("data", [])
    items = []
    for idx, row in enumerate(rows[:limit], 1):
        title = row.get("Title", "")
        items.append({
            "rank": idx,
            "title": title,
            "url": row.get("Url", ""),
            "hot": row.get("HotValue", ""),
        })
    return items


def fetch_hot_hackernews(limit: int = 20, proxy: str = "") -> List[Dict[str, Any]]:
    data = http_get_json(
        f"https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage={limit}",
        proxy=proxy,
    )
    items = []
    for idx, row in enumerate(data.get("hits", [])[:limit], 1):
        items.append({
            "rank": idx,
            "title": row.get("title", ""),
            "url": row.get("url") or f"https://news.ycombinator.com/item?id={row.get('objectID')}",
            "points": row.get("points", 0),
            "comments": row.get("num_comments", 0),
        })
    return items


def fetch_hot_github(limit: int = 20, proxy: str = "") -> List[Dict[str, Any]]:
    # 查询最近 7 天高星增长活跃仓库
    week_ago = time.strftime("%Y-%m-%d", time.gmtime(time.time() - 7 * 86400))
    url = f"https://api.github.com/search/repositories?q=created:>{week_ago}&sort=stars&order=desc&per_page={limit}"
    data = http_get_json(url, proxy=proxy)
    items = []
    for idx, repo in enumerate(data.get("items", [])[:limit], 1):
        items.append({
            "rank": idx,
            "title": repo.get("full_name", ""),
            "desc": repo.get("description") or "",
            "url": repo.get("html_url", ""),
            "stars": repo.get("stargazers_count", 0),
            "language": repo.get("language") or "",
        })
    return items


HOT_PROVIDERS = {
    "bilibili": fetch_hot_bilibili,
    "weibo": fetch_hot_weibo,
    "douyin": fetch_hot_douyin,
    "baidu": fetch_hot_baidu,
    "toutiao": fetch_hot_toutiao,
    "hackernews": fetch_hot_hackernews,
    "github": fetch_hot_github,
}


def apply_trendradar_filter(items: List[Dict[str, Any]], filter_expr: str) -> List[Dict[str, Any]]:
    """
    TrendRadar 风格三层关键词过滤：
      +词  -> 必须包含
      !词  -> 必须排除
      普通词 -> 任一命中即可（若未提供普通词，则默认通过）
    支持空格或逗号分隔。
    """
    if not filter_expr or not filter_expr.strip():
        return items
    tokens = [t.strip() for t in re.split(r"[\s,，]+", filter_expr.strip()) if t.strip()]
    must_words = [t[1:].lower() for t in tokens if t.startswith("+") and len(t) > 1]
    ban_words = [t[1:].lower() for t in tokens if t.startswith("!") and len(t) > 1]
    any_words = [t.lower() for t in tokens if not t.startswith("+") and not t.startswith("!")]

    matched = []
    for it in items:
        blob = f"{it.get('title', '')} {it.get('desc', '')} {it.get('rcmd_reason', '')}".lower()
        if any(bw in blob for bw in ban_words):
            continue
        if any(mw not in blob for mw in must_words):
            continue
        if any_words and not any(aw in blob for aw in any_words):
            continue
        matched.append(it)
    return matched


def cmd_hot(args: argparse.Namespace) -> int:
    cfg = load_config()
    proxy = args.proxy if args.proxy is not None else (cfg.get("global_proxy", "") if cfg.get("use_global_proxy") else "")
    raw_plats = args.platforms.strip().lower()
    if raw_plats == "all":
        plats = list(HOT_PROVIDERS.keys())
    elif raw_plats == "cn":
        plats = ["bilibili", "douyin", "weibo", "baidu", "toutiao"]
    elif raw_plats == "global":
        plats = ["github", "hackernews"]
    else:
        plats = [p.strip() for p in raw_plats.split(",") if p.strip()]

    results: Dict[str, Any] = {}
    for p in plats:
        if p not in HOT_PROVIDERS:
            results[p] = {"status": "error", "error": f"未知热榜平台: {p}，支持: {list(HOT_PROVIDERS.keys())}"}
            continue
        try:
            if p in ("hackernews", "github"):
                try:
                    rows = HOT_PROVIDERS[p](args.limit, proxy=proxy)
                except Exception:
                    rows = HOT_PROVIDERS[p](args.limit, proxy="")
            else:
                rows = HOT_PROVIDERS[p](args.limit)
            filtered = apply_trendradar_filter(rows, args.filter)
            results[p] = {"status": "ok", "total": len(rows), "matched": len(filtered), "items": filtered}
        except Exception as e:
            results[p] = {"status": "error", "error": str(e)}

    print(json.dumps({"status": "ok", "filter": args.filter, "platforms": results}, ensure_ascii=False, indent=2))
    return 0


# ============================================================================
# 2. 指定平台关键词搜索（支持 API 快速搜索 + Playwright 本机 Edge 深度搜索）
# ============================================================================

PLATFORM_SEARCH_URLS = {
    "bilibili": "https://search.bilibili.com/all?keyword={q}",
    "douyin": "https://www.douyin.com/search/{q}",
    "kuaishou": "https://www.kuaishou.com/search/video?searchKey={q}",
    "xiaohongshu": "https://www.xiaohongshu.com/search_result?keyword={q}",
    "zhihu": "https://www.zhihu.com/search?type=content&q={q}",
    "weibo": "https://s.weibo.com/weibo?q={q}",
    "youtube": "https://www.youtube.com/results?search_query={q}",
    "tiktok": "https://www.tiktok.com/search?q={q}",
    "github": "https://github.com/search?q={q}&type=repositories",
    "bing": "https://cn.bing.com/search?q={q}",
}


def search_bilibili_popular_or_suggest(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    # 使用 B站无需 WBI 签名的搜索建议与公开接口或退回浏览器
    url = f"https://s.search.bilibili.com/main/suggest?func=suggest&suggest_type=accurate&sub_type=tag&main_ver=v1&term={urllib.parse.quote(query)}"
    data = http_get_json(url, headers={"Referer": "https://www.bilibili.com/"})
    tags = data.get("result", {}).get("tag", [])
    return [{"title": t.get("value", ""), "name": t.get("name", "")} for t in tags[:limit]]


def search_github_api(query: str, limit: int = 10, proxy: str = "") -> List[Dict[str, Any]]:
    url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(query)}&sort=stars&order=desc&per_page={limit}"
    try:
        data = http_get_json(url, proxy=proxy)
    except Exception:
        data = http_get_json(url, proxy="")
    items = []
    for r in data.get("items", [])[:limit]:
        items.append({
            "title": r.get("full_name", ""),
            "desc": r.get("description") or "",
            "url": r.get("html_url", ""),
            "stars": r.get("stargazers_count", 0),
            "updated_at": r.get("updated_at", ""),
        })
    return items


def search_hackernews_api(query: str, limit: int = 10, proxy: str = "") -> List[Dict[str, Any]]:
    url = f"https://hn.algolia.com/api/v1/search?query={urllib.parse.quote(query)}&hitsPerPage={limit}"
    try:
        data = http_get_json(url, proxy=proxy)
    except Exception:
        data = http_get_json(url, proxy="")
    items = []
    for h in data.get("hits", [])[:limit]:
        items.append({
            "title": h.get("title") or h.get("story_title") or "",
            "url": h.get("url") or f"https://news.ycombinator.com/item?id={h.get('objectID')}",
            "points": h.get("points", 0),
            "author": h.get("author", ""),
            "created_at": h.get("created_at", ""),
        })
    return items


def search_via_edge_browser(platform: str, query: str, limit: int = 12, headless: bool = True, proxy_override: Optional[str] = None) -> Dict[str, Any]:
    """
    复用 E:/video-publisher 的本机 Edge 持久化 Profile，在指定社交平台打开搜索结果页并提取结构化卡片列表。
    """
    from playwright.sync_api import sync_playwright
    from platforms.base import launch_edge_context

    cfg = load_config()
    account = cfg.get("default_account", "default")
    url_tpl = PLATFORM_SEARCH_URLS.get(platform, PLATFORM_SEARCH_URLS["bing"])
    target_url = url_tpl.format(q=urllib.parse.quote(query))

    with sync_playwright() as pw:
        ctx = launch_edge_context(
            pw,
            ROOT_DIR,
            cfg,
            account,
            platform if platform in ("youtube", "tiktok", "instagram") else "douyin",
            headless=headless,
            proxy_override=proxy_override,
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        try:
            page.goto(target_url, wait_until="domcontentloaded", timeout=45000)
            time.sleep(3.5)
            # 提取页面上所有有意义的内容链接与文本摘要
            extracted = page.evaluate(
                """(maxItems) => {
                    const results = [];
                    const seen = new Set();
                    const anchors = Array.from(document.querySelectorAll('a[href]'));
                    for (const a of anchors) {
                        const href = a.href || '';
                        const text = (a.innerText || a.getAttribute('title') || '').replace(/\\s+/g, ' ').trim();
                        if (!text || text.length < 6 || seen.has(href)) continue;
                        if (href.startsWith('javascript:')) continue;
                        seen.add(href);
                        results.push({ title: text.slice(0, 160), url: href });
                        if (results.length >= maxItems) break;
                    }
                    const bodyText = (document.body ? document.body.innerText : '').replace(/\\s+/g, ' ').slice(0, 2500);
                    return { pageTitle: document.title, url: location.href, items: results, textSnippet: bodyText };
                }""",
                limit,
            )
            return {"status": "ok", "platform": platform, "query": query, "data": extracted}
        except Exception as e:
            return {"status": "error", "platform": platform, "query": query, "error": str(e)}
        finally:
            try:
                ctx.close()
            except Exception:
                pass


def cmd_search(args: argparse.Namespace) -> int:
    cfg = load_config()
    proxy = args.proxy if args.proxy is not None else (cfg.get("global_proxy", "") if cfg.get("use_global_proxy") else "")
    p = args.platform.strip().lower()
    q = args.query.strip()

    if not args.browser and p == "github":
        items = search_github_api(q, args.limit, proxy=proxy)
        print(json.dumps({"status": "ok", "platform": p, "mode": "api", "query": q, "items": items}, ensure_ascii=False, indent=2))
        return 0

    if not args.browser and p == "hackernews":
        items = search_hackernews_api(q, args.limit, proxy=proxy)
        print(json.dumps({"status": "ok", "platform": p, "mode": "api", "query": q, "items": items}, ensure_ascii=False, indent=2))
        return 0

    # 其余平台（如小红书/抖音/快手/B站/知乎/YouTube/TikTok/Bing）直接用本机 Edge 浏览器检索
    res = search_via_edge_browser(p, q, limit=args.limit, headless=not args.headed, proxy_override=args.proxy)
    print(json.dumps(res, ensure_ascii=False, indent=2))
    return 0 if res.get("status") == "ok" else 1


# ============================================================================
# 3. 指定网页正文提取（支持 HTTP 快速抓取与 Edge 浏览器动态渲染抓取）
# ============================================================================

def cmd_fetch(args: argparse.Namespace) -> int:
    url = args.url.strip()
    if args.browser:
        from playwright.sync_api import sync_playwright
        from platforms.base import launch_edge_context

        cfg = load_config()
        is_global = any(d in url.lower() for d in ["youtube.com", "tiktok.com", "instagram.com", "reddit.com", "x.com", "twitter.com"])
        with sync_playwright() as pw:
            ctx = launch_edge_context(
                pw,
                ROOT_DIR,
                cfg,
                cfg.get("default_account", "default"),
                "youtube" if is_global else "douyin",
                headless=not args.headed,
                proxy_override=args.proxy,
            )
            page = ctx.pages[0] if ctx.pages else ctx.new_page()
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
                time.sleep(2.5)
                title = page.title()
                text = page.evaluate("() => document.body ? document.body.innerText : ''")
                print(json.dumps({"status": "ok", "url": url, "title": title, "content": text[: args.max_chars]}, ensure_ascii=False, indent=2))
                return 0
            finally:
                try:
                    ctx.close()
                except Exception:
                    pass
    else:
        raw = http_get_text(url, proxy=args.proxy or "")
        title_m = re.search(r"<title[^>]*>(.*?)</title>", raw, re.IGNORECASE | re.DOTALL)
        title = html.unescape(title_m.group(1).strip()) if title_m else ""
        cleaned = re.sub(r"<script[\s\S]*?</script>", " ", raw, flags=re.IGNORECASE)
        cleaned = re.sub(r"<style[\s\S]*?</style>", " ", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"<[^>]+>", " ", cleaned)
        cleaned = html.unescape(re.sub(r"\s+", " ", cleaned)).strip()
        print(json.dumps({"status": "ok", "url": url, "title": title, "content": cleaned[: args.max_chars]}, ensure_ascii=False, indent=2))
        return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="info", description="多平台实时热榜聚合 + 特定平台搜索 + 网页提取 CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_hot = sub.add_parser("hot", help="获取多平台实时热搜榜（B站/抖音/微博/百度/头条/GitHub/HackerNews）并支持关键词过滤")
    p_hot.add_argument("--platforms", default="cn", help="all | cn | global | 逗号分隔: bilibili,douyin,weibo,baidu,toutiao,github,hackernews")
    p_hot.add_argument("--limit", type=int, default=15, help="每个平台返回条数（默认 15）")
    p_hot.add_argument("--filter", default="", help="TrendRadar 风格过滤表达式，如 '+游戏 !广告 我的世界,独立游戏'")
    p_hot.add_argument("--proxy", default=None, help="可选代理地址")
    p_hot.set_defaults(func=cmd_hot)

    p_search = sub.add_parser("search", help="在指定平台搜索关键词（支持 bilibili/douyin/kuaishou/xiaohongshu/zhihu/weibo/youtube/tiktok/github/hackernews/bing）")
    p_search.add_argument("--platform", required=True, help="目标平台名称")
    p_search.add_argument("--query", required=True, help="搜索关键词")
    p_search.add_argument("--limit", type=int, default=12, help="最大返回结果数")
    p_search.add_argument("--browser", action="store_true", help="强制使用本机 Edge 持久化浏览器渲染搜索")
    p_search.add_argument("--headed", action="store_true", help="弹出可见浏览器窗口（适合需要扫码或过验证码时）")
    p_search.add_argument("--proxy", default=None, help="可选代理覆盖")
    p_search.set_defaults(func=cmd_search)

    p_fetch = sub.add_parser("fetch", help="提取指定网页的正文内容")
    p_fetch.add_argument("--url", required=True, help="目标网页 URL")
    p_fetch.add_argument("--browser", action="store_true", help="使用本机 Edge 渲染动态网页")
    p_fetch.add_argument("--headed", action="store_true", help="弹出可见浏览器窗口")
    p_fetch.add_argument("--max-chars", type=int, default=6000, help="最大返回正文字符数")
    p_fetch.add_argument("--proxy", default=None, help="可选代理覆盖")
    p_fetch.set_defaults(func=cmd_fetch)

    return parser


if __name__ == "__main__":
    parser = build_parser()
    ns = parser.parse_args()
    sys.exit(ns.func(ns))
