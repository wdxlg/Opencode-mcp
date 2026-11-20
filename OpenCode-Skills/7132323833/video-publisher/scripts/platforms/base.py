import os
import time
from typing import Dict, Any, List, Optional
from playwright.sync_api import BrowserContext, Page, Playwright

CN_PLATFORMS = {"douyin", "kuaishou", "xiaohongshu", "bilibili"}
GLOBAL_PLATFORMS = {"youtube", "tiktok", "instagram"}


def get_profile_dir(root_dir: str, account: str, platform: str) -> str:
    group = "cn" if platform in CN_PLATFORMS else "global"
    path = os.path.join(root_dir, "profiles", f"{account}_{group}")
    os.makedirs(path, exist_ok=True)
    return path


def launch_edge_context(
    pw: Playwright,
    root_dir: str,
    cfg: Dict[str, Any],
    account: str,
    platform: str,
    headless: bool = False,
    proxy_override: Optional[str] = None,
) -> BrowserContext:
    user_data_dir = get_profile_dir(root_dir, account, platform)
    kwargs: Dict[str, Any] = {
        "user_data_dir": user_data_dir,
        "headless": headless,
        "viewport": {"width": 1440, "height": 900},
        "args": [
            "--disable-blink-features=AutomationControlled",
            "--no-default-browser-check",
            "--no-first-run",
        ],
    }
    edge_exe = cfg.get("edge_executable", "")
    if edge_exe and os.path.isfile(edge_exe):
        kwargs["executable_path"] = edge_exe
    else:
        kwargs["channel"] = cfg.get("edge_channel", "msedge")

    # Domestic platforms always use direct connection; global platforms use proxy if configured
    if platform in GLOBAL_PLATFORMS:
        proxy_url = proxy_override if proxy_override is not None else (
            cfg.get("global_proxy") if cfg.get("use_global_proxy", True) else ""
        )
        if proxy_url:
            kwargs["proxy"] = {"server": proxy_url}

    ctx = pw.chromium.launch_persistent_context(**kwargs)
    ctx.add_init_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
    )
    return ctx


def format_hashtags(tags: List[str]) -> str:
    cleaned = [t.strip().lstrip("#") for t in tags if t and t.strip()]
    return " ".join(f"#{t}" for t in cleaned)


def try_fill_first(page: Page, selectors: List[str], text: str, timeout_ms: int = 4000) -> bool:
    if not text:
        return False
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            loc.wait_for(state="visible", timeout=timeout_ms)
            loc.click()
            loc.fill(text)
            return True
        except Exception:
            continue
    return False


def try_type_contenteditable(page: Page, selectors: List[str], text: str, timeout_ms: int = 4000) -> bool:
    if not text:
        return False
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            loc.wait_for(state="visible", timeout=timeout_ms)
            loc.click()
            page.keyboard.insert_text(text)
            return True
        except Exception:
            continue
    return False


def try_click_first(page: Page, selectors: List[str], timeout_ms: int = 4000) -> bool:
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            loc.wait_for(state="visible", timeout=timeout_ms)
            loc.click()
            return True
        except Exception:
            continue
    return False


def set_file_on_first_input(page: Page, selectors: List[str], file_path: str, timeout_ms: int = 10000) -> bool:
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            loc.wait_for(state="attached", timeout=timeout_ms)
            loc.set_input_files(file_path)
            return True
        except Exception:
            continue
    return False
