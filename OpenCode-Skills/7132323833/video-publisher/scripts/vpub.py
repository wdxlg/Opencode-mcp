#!/usr/bin/env python3
"""
vpub - Polo-Balls 自动录制 + 7 平台视频全自动发布 CLI
支持平台：抖音 (douyin) / 快手 (kuaishou) / 小红书 (xiaohongshu) / Bilibili (bilibili) / YouTube (youtube) / TikTok (tiktok) / Instagram (instagram)
支持录制：
  - sim  (右键离线模拟录制：调用 Godot.4.7.2.offline.exe 固定帧时钟与离线音频，输出中英双语 1080x1920/60fps MP4 与 4 张封面)
  - live (左键实时对战录制：实时渲染并输出中英双语 MP4 与 4 张封面)
"""
import argparse
import glob
import json
import os
import re
import socket
import subprocess
import sys
import time
from typing import Dict, Any, List, Optional, Tuple
from urllib.parse import urlparse

sys.dont_write_bytecode = True
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)


def _resolve_runtime_dir() -> str:
    env_home = os.environ.get("VPUB_HOME")
    if env_home:
        return os.path.abspath(env_home)
    if os.path.isdir("E:/video-publisher"):
        return os.path.abspath("E:/video-publisher")
    # Portable fallback inside OpenCode data directory
    candidate = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", "..", "video-publisher"))
    os.makedirs(candidate, exist_ok=True)
    return candidate


ROOT_DIR = _resolve_runtime_dir()
CONFIG_PATH = (
    os.path.join(ROOT_DIR, "config.json")
    if os.path.isfile(os.path.join(ROOT_DIR, "config.json"))
    else os.path.join(SCRIPT_DIR, "config.json")
)
RUNNER_GD_PATH = (
    os.path.join(SCRIPT_DIR, "polo_record_runner.gd")
    if os.path.isfile(os.path.join(SCRIPT_DIR, "polo_record_runner.gd"))
    else os.path.join(ROOT_DIR, "polo_record_runner.gd")
)

from platforms import PLATFORM_URLS, PLATFORM_HANDLERS
from platforms.base import CN_PLATFORMS, GLOBAL_PLATFORMS, get_profile_dir, launch_edge_context

ALL_PLATFORMS = ["douyin", "kuaishou", "xiaohongshu", "bilibili", "youtube", "tiktok", "instagram"]


def load_config() -> Dict[str, Any]:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def check_proxy_reachable(proxy_url: str) -> bool:
    if not proxy_url:
        return False
    try:
        u = urlparse(proxy_url)
        host = u.hostname or "127.0.0.1"
        port = u.port or 80
        with socket.create_connection((host, port), timeout=1.5):
            return True
    except Exception:
        return False


def parse_platforms(raw: str) -> List[str]:
    raw = raw.strip().lower()
    if raw == "all":
        return list(ALL_PLATFORMS)
    if raw == "cn":
        return ["douyin", "kuaishou", "xiaohongshu", "bilibili"]
    if raw == "global":
        return ["youtube", "tiktok", "instagram"]
    items = [p.strip() for p in raw.split(",") if p.strip()]
    invalid = [p for p in items if p not in ALL_PLATFORMS]
    if invalid:
        raise ValueError(f"不支持的平台名称: {invalid}，可选: {ALL_PLATFORMS}")
    return items


def parse_team_arg(team_name: str, spec_str: str) -> List[Dict[str, Any]]:
    """
    解析形如 '烈焰人' 或 '钻石剑*3,木剑*2' 或 'random*3' 的阵容字符串
    """
    entries: List[Dict[str, Any]] = []
    for part in spec_str.split(","):
        part = part.strip()
        if not part:
            continue
        if "*" in part:
            c_name, cnt_s = part.split("*", 1)
            cnt = max(1, int(cnt_s.strip()))
            entries.append({"team": team_name, "char": c_name.strip(), "count": cnt})
        else:
            entries.append({"team": team_name, "char": part, "count": 1})
    return entries


def extract_cover(ffmpeg_path: str, video_path: str, out_path: str = "", timestamp: str = "00:00:01") -> str:
    if not out_path:
        base, _ = os.path.splitext(os.path.abspath(video_path))
        out_path = base + ".cover.jpg"
    cmd = [
        ffmpeg_path,
        "-y",
        "-ss",
        timestamp,
        "-i",
        os.path.abspath(video_path),
        "-frames:v",
        "1",
        "-q:v",
        "2",
        out_path,
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    return out_path


def find_latest_polo_recording(cfg: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    在 E:/video-publisher/recordings 和 %APPDATA%/Godot/app_userdata/polo_balls/recordings 中查找最新录制的对局文件夹或双语视频
    """
    search_roots = [
        cfg.get("recordings_output_dir", ""),
        cfg.get("polo_user_recordings_dir", ""),
    ]
    candidates: List[Tuple[float, str]] = []
    for r in search_roots:
        if not r or not os.path.isdir(r):
            continue
        for entry in os.listdir(r):
            full = os.path.join(r, entry)
            if os.path.isdir(full):
                zh_mp4 = os.path.join(full, "中文.mp4")
                en_mp4 = os.path.join(full, "English.mp4")
                if os.path.isfile(zh_mp4) or os.path.isfile(en_mp4):
                    mtime = max(
                        os.path.getmtime(zh_mp4) if os.path.isfile(zh_mp4) else 0.0,
                        os.path.getmtime(en_mp4) if os.path.isfile(en_mp4) else 0.0,
                    )
                    candidates.append((mtime, full))
    if not candidates:
        return None
    candidates.sort(key=lambda x: x[0], reverse=True)
    latest_folder = candidates[0][1]
    folder_name = os.path.basename(latest_folder)
    zh_mp4 = os.path.join(latest_folder, "中文.mp4")
    en_mp4 = os.path.join(latest_folder, "English.mp4")
    covers = {}
    for k, fn in [
        ("zh_9x16", "中文封面_9x16.jpg"),
        ("zh_16x9", "中文封面_16x9.jpg"),
        ("en_9x16", "English_cover_9x16.jpg"),
        ("en_16x9", "English_cover_16x9.jpg"),
    ]:
        cp = os.path.join(latest_folder, fn)
        if os.path.isfile(cp):
            covers[k] = cp
    return {
        "status": "ok",
        "source": "latest_folder",
        "title_zh": folder_name,
        "title_en": folder_name,
        "folder": latest_folder,
        "outputs": {
            "zh": zh_mp4 if os.path.isfile(zh_mp4) else en_mp4,
            "en": en_mp4 if os.path.isfile(en_mp4) else zh_mp4,
        },
        "covers": covers,
    }


def build_auto_copy_from_recording(rec: Dict[str, Any], tid: int = 17) -> Dict[str, Any]:
    """
    根据 polo-balls 录制结果的中文对阵名 (title_zh) 与英文对阵名 (title_en)，
    自动把中文视频+中文封面路由给国内 4 平台，英文视频+英文封面路由给海外 3 平台，并生成默认平台文案。
    """
    title_zh = rec.get("title_zh") or "小球对战"
    title_en = rec.get("title_en") or "Polo Balls Battle"
    outputs = rec.get("outputs", {})
    covers = rec.get("covers", {})

    video_zh = outputs.get("zh") or outputs.get("en") or ""
    video_en = outputs.get("en") or outputs.get("zh") or ""
    cover_zh_9x16 = covers.get("zh_9x16") or covers.get("zh_16x9") or ""
    cover_zh_16x9 = covers.get("zh_16x9") or covers.get("zh_9x16") or ""
    cover_en_9x16 = covers.get("en_9x16") or covers.get("en_16x9") or ""
    cover_en_16x9 = covers.get("en_16x9") or covers.get("en_9x16") or ""

    return {
        "video": video_zh,
        "video_zh": video_zh,
        "video_en": video_en,
        "covers": covers,
        "title_zh": title_zh,
        "title_en": title_en,
        "platforms": {
            "douyin": {
                "enabled": True,
                "video": video_zh,
                "cover": cover_zh_9x16,
                "title": f"Mc小球对决：{title_zh}"[:30],
                "desc": f"{title_zh}！谁能活到最后？",
                "tags": ["Mc小球", "小球对战", "我的世界", "电子斗蛐蛐", "独立游戏"],
            },
            "kuaishou": {
                "enabled": True,
                "video": video_zh,
                "cover": cover_zh_9x16,
                "title": f"Mc小球对决：{title_zh}",
                "desc": f"{title_zh}！猜猜谁赢？",
                "tags": ["Mc小球", "小球对战", "我的世界", "电子斗蛐蛐"],
            },
            "xiaohongshu": {
                "enabled": True,
                "video": video_zh,
                "cover": cover_zh_9x16,
                "title": f"小球对决：{title_zh}"[:20],
                "desc": f"今日对阵：{title_zh}\n全程高能，看到最后！",
                "tags": ["Mc小球", "小球对战", "电子斗蛐蛐", "我的世界", "解压视频"],
            },
            "bilibili": {
                "enabled": True,
                "video": video_zh,
                "cover": cover_zh_16x9,
                "title": f"【Mc小球】{title_zh}"[:80],
                "desc": f"本局对阵：{title_zh}\n喜欢看的欢迎一键三连支持！",
                "tags": ["Mc小球", "小球对战", "我的世界", "电子斗蛐蛐", "单机游戏"],
                "tid": tid,
            },
            "youtube": {
                "enabled": True,
                "video": video_en,
                "cover": cover_en_9x16 or cover_en_16x9,
                "title": f"Polo Balls Battle: {title_en} #shorts"[:100],
                "desc": f"Matchup: {title_en}\nWho will win this battle? Subscribe for more Polo Balls fights!",
                "tags": ["shorts", "poloballs", "minecraft", "simulation", "gaming"],
                "visibility": "PUBLIC",
            },
            "tiktok": {
                "enabled": True,
                "video": video_en,
                "cover": cover_en_9x16,
                "title": f"{title_en} - Who wins?",
                "desc": "Wait for the ending!",
                "tags": ["poloballs", "minecraft", "fyp", "gaming", "simulation"],
            },
            "instagram": {
                "enabled": True,
                "video": video_en,
                "cover": cover_en_9x16,
                "title": f"{title_en} Battle!",
                "desc": "Who are you betting on?",
                "tags": ["reels", "poloballs", "minecraft", "gaming", "simulation"],
            },
        },
    }


def cmd_status(args: argparse.Namespace) -> int:
    cfg = load_config()
    edge_exe = cfg.get("edge_executable", "")
    ffmpeg_exe = cfg.get("ffmpeg_path", "")
    proxy_url = cfg.get("global_proxy", "")
    offline_engine = cfg.get("polo_offline_engine", "")
    release_engine = cfg.get("polo_release_engine", "")
    polo_dir = cfg.get("polo_project_dir", "")
    account = args.account or cfg.get("default_account", "default")

    cn_dir = get_profile_dir(ROOT_DIR, account, "douyin")
    global_dir = get_profile_dir(ROOT_DIR, account, "youtube")
    latest = find_latest_polo_recording(cfg)

    info = {
        "tool_root": ROOT_DIR,
        "python": sys.executable,
        "polo_project_dir": polo_dir,
        "polo_project_exists": os.path.isfile(os.path.join(polo_dir, "project.godot")),
        "polo_offline_engine": offline_engine,
        "polo_offline_engine_exists": os.path.isfile(offline_engine),
        "polo_release_engine": release_engine,
        "polo_release_engine_exists": os.path.isfile(release_engine),
        "edge_executable": edge_exe,
        "edge_exists": os.path.isfile(edge_exe),
        "ffmpeg_path": ffmpeg_exe,
        "ffmpeg_exists": os.path.isfile(ffmpeg_exe),
        "global_proxy": proxy_url,
        "global_proxy_reachable": check_proxy_reachable(proxy_url),
        "account": account,
        "default_mode": cfg.get("default_mode", "auto"),
        "default_record_mode": cfg.get("default_record_mode", "sim"),
        "cn_profile_dir": cn_dir,
        "cn_profile_initialized": os.path.exists(os.path.join(cn_dir, "Local State")),
        "global_profile_dir": global_dir,
        "global_profile_initialized": os.path.exists(os.path.join(global_dir, "Local State")),
        "latest_recording": latest,
        "supported_platforms": ALL_PLATFORMS,
    }
    print(json.dumps(info, ensure_ascii=False, indent=2))
    return 0


def cmd_chars(args: argparse.Namespace) -> int:
    cfg = load_config()
    polo_dir = cfg.get("polo_project_dir", "E:/godot/polo-balls")
    chars_dir = os.path.join(polo_dir, "scenes", "characters")
    scripts_dir = os.path.join(polo_dir, "scripts", "characters")
    names = set()
    for base in [chars_dir, scripts_dir]:
        if os.path.isdir(base):
            for dp, _, fns in os.walk(base):
                for fn in fns:
                    if fn.endswith(".tscn") or fn.endswith(".gd"):
                        stem = os.path.splitext(fn)[0]
                        if not stem.startswith("_"):
                            names.add(stem)
    sorted_names = sorted(names)
    if args.search:
        kw = args.search.lower()
        sorted_names = [n for n in sorted_names if kw in n.lower()]
    print(json.dumps({"count": len(sorted_names), "characters": sorted_names, "special": ["random", "不死盔甲架"]}, ensure_ascii=False, indent=2))
    return 0


def run_polo_recording(cfg: Dict[str, Any], args: argparse.Namespace) -> Dict[str, Any]:
    if getattr(args, "use_latest", False):
        latest = find_latest_polo_recording(cfg)
        if not latest:
            return {"status": "error", "error": "未找到已有录制文件夹"}
        return latest

    record_mode = (getattr(args, "record_mode", "") or cfg.get("default_record_mode", "sim")).lower()
    engine_path = cfg.get("polo_offline_engine", "")
    if record_mode == "live" and not os.path.isfile(engine_path):
        engine_path = cfg.get("polo_release_engine", "")
    if not os.path.isfile(engine_path):
        return {"status": "error", "error": f"找不到录制引擎可执行文件: {engine_path}"}

    polo_dir = cfg.get("polo_project_dir", "E:/godot/polo-balls")
    out_dir = getattr(args, "output_dir", "") or cfg.get("recordings_output_dir", "E:/video-publisher/recordings")
    os.makedirs(out_dir, exist_ok=True)

    teams: List[Dict[str, Any]] = []
    if getattr(args, "teams_json", ""):
        teams = json.loads(args.teams_json)
    else:
        t0 = getattr(args, "team0", "") or "烈焰人"
        t1 = getattr(args, "team1", "") or "铁傀儡"
        teams.extend(parse_team_arg("Team0", t0))
        teams.extend(parse_team_arg("Team1", t1))
        if getattr(args, "team2", ""):
            teams.extend(parse_team_arg("Team2", args.team2))

    stamp = int(time.time() * 1000)
    spec_path = os.path.join(ROOT_DIR, "tasks", f"record_spec_{stamp}.json").replace("\\", "/")
    result_path = os.path.join(ROOT_DIR, "tasks", f"record_result_{stamp}.json").replace("\\", "/")

    rec_spec = {
        "record_mode": record_mode,
        "battle_type": getattr(args, "battle_type", "duel") or "duel",
        "showcase_char": getattr(args, "showcase_char", "") or "烈焰人",
        "teams": teams,
        "map": getattr(args, "map", "") or "Map10x10",
        "training_mode_type": getattr(args, "training_mode_type", "") or "manual",
        "composition": int(getattr(args, "composition", 0) or 0),
        "tail_seconds": float(getattr(args, "tail_seconds", 3.5) or 3.5),
        "max_duration_seconds": float(getattr(args, "max_duration", 180.0) or 180.0),
        "output_dir": out_dir.replace("\\", "/"),
        "result_json": result_path,
    }
    with open(spec_path, "w", encoding="utf-8") as f:
        json.dump(rec_spec, f, ensure_ascii=False, indent=2)

    if getattr(args, "dry_run", False):
        return {
            "status": "dry_run",
            "engine": engine_path,
            "command": [engine_path, "--path", polo_dir, "--script", RUNNER_GD_PATH.replace("\\", "/"), "--", spec_path],
            "record_spec": rec_spec,
        }

    cmd = [
        engine_path,
        "--path",
        polo_dir,
        "--script",
        RUNNER_GD_PATH.replace("\\", "/"),
        "--",
        spec_path,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if os.path.isfile(result_path):
        with open(result_path, "r", encoding="utf-8", errors="replace") as f:
            res = json.load(f)
        return res

    # Fallback: parse POLO_RECORD_RESULT line from stdout
    for line in proc.stdout.splitlines():
        if line.startswith("POLO_RECORD_RESULT "):
            try:
                return json.loads(line[len("POLO_RECORD_RESULT "):].strip())
            except Exception:
                pass
    return {
        "status": "error",
        "exit_code": proc.returncode,
        "error": "未生成录制结果文件",
        "stdout_tail": proc.stdout[-1500:],
        "stderr_tail": proc.stderr[-1500:],
    }


def cmd_record(args: argparse.Namespace) -> int:
    cfg = load_config()
    res = run_polo_recording(cfg, args)
    print(json.dumps(res, ensure_ascii=False, indent=2))
    return 0 if res.get("status") in ("ok", "dry_run") else 1


def cmd_cover(args: argparse.Namespace) -> int:
    cfg = load_config()
    video = os.path.abspath(args.video)
    if not os.path.isfile(video):
        print(json.dumps({"status": "error", "message": f"视频文件不存在: {video}"}, ensure_ascii=False))
        return 1
    out = extract_cover(cfg["ffmpeg_path"], video, args.out or "", args.time)
    print(json.dumps({"status": "ok", "video": video, "cover": out}, ensure_ascii=False, indent=2))
    return 0


def cmd_template(args: argparse.Namespace) -> int:
    cfg = load_config()
    if args.from_latest:
        latest = find_latest_polo_recording(cfg)
        if not latest:
            print(json.dumps({"status": "error", "message": "未找到已有录制结果"}, ensure_ascii=False))
            return 1
        spec = build_auto_copy_from_recording(latest, cfg.get("default_bilibili_tid", 17))
    else:
        video = os.path.abspath(args.video) if args.video else "D:/path/to/video.mp4"
        rec_stub = {
            "title_zh": args.title or "烈焰人 vs 铁傀儡",
            "title_en": args.title_en or "Blaze vs Iron Golem",
            "outputs": {"zh": video, "en": video},
            "covers": {},
        }
        spec = build_auto_copy_from_recording(rec_stub, cfg.get("default_bilibili_tid", 17))

    spec["account"] = "default"
    spec["mode"] = cfg.get("default_mode", "auto")
    if args.out:
        out_path = os.path.abspath(args.out)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(spec, f, ensure_ascii=False, indent=2)
        print(json.dumps({"status": "ok", "spec_file": out_path, "spec": spec}, ensure_ascii=False, indent=2))
    else:
        print(json.dumps(spec, ensure_ascii=False, indent=2))
    return 0


def cmd_login(args: argparse.Namespace) -> int:
    from playwright.sync_api import sync_playwright

    cfg = load_config()
    platforms = parse_platforms(args.platforms)
    account = args.account or cfg.get("default_account", "default")
    cn_group = [p for p in platforms if p in CN_PLATFORMS]
    gl_group = [p for p in platforms if p in GLOBAL_PLATFORMS]

    with sync_playwright() as pw:
        for group_name, group_list in [("国内平台 (直连)", cn_group), ("海外平台 (代理)", gl_group)]:
            if not group_list:
                continue
            print(f"正在打开 {group_name} 登录窗口: {group_list} ...")
            print("请在弹出的 Edge 窗口中完成扫码/登录，全部登录完成后直接关闭浏览器窗口即可自动保存！")
            ctx = launch_edge_context(pw, ROOT_DIR, cfg, account, group_list[0], headless=False, proxy_override=args.proxy)
            for idx, p in enumerate(group_list):
                page = ctx.pages[0] if (idx == 0 and ctx.pages) else ctx.new_page()
                try:
                    page.goto(PLATFORM_URLS[p], wait_until="domcontentloaded", timeout=45000)
                except Exception as e:
                    print(f"[{p}] 打开页面提示: {e}")
            try:
                while len(ctx.pages) > 0:
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
            finally:
                try:
                    ctx.close()
                except Exception:
                    pass
    print(json.dumps({"status": "ok", "account": account, "logged_groups": platforms}, ensure_ascii=False))
    return 0


def execute_publish_from_spec(cfg: Dict[str, Any], spec: Dict[str, Any], args: argparse.Namespace) -> Dict[str, Any]:
    account = getattr(args, "account", "") or spec.get("account") or cfg.get("default_account", "default")
    mode = getattr(args, "mode", "") or spec.get("mode") or cfg.get("default_mode", "auto")
    plat_map = spec.get("platforms", {})
    selected = parse_platforms(args.platforms) if getattr(args, "platforms", "") else [
        p for p, v in plat_map.items() if v.get("enabled", True)
    ]

    default_video_zh = spec.get("video_zh") or spec.get("video") or ""
    default_video_en = spec.get("video_en") or spec.get("video") or default_video_zh
    default_cover = spec.get("cover", "")

    plan = []
    for p in selected:
        p_cfg = plat_map.get(p, {})
        p_video = p_cfg.get("video") or (default_video_zh if p in CN_PLATFORMS else default_video_en)
        if p_video:
            p_video = os.path.abspath(p_video)
        p_cover = p_cfg.get("cover") or default_cover
        if not p_cover and p_video and os.path.isfile(p_video) and os.path.isfile(cfg.get("ffmpeg_path", "")):
            try:
                p_cover = extract_cover(cfg["ffmpeg_path"], p_video)
            except Exception:
                p_cover = ""
        plan.append({
            "platform": p,
            "network": "direct" if p in CN_PLATFORMS else (getattr(args, "proxy", None) or cfg.get("global_proxy", "direct")),
            "video": p_video,
            "cover": p_cover,
            "title": p_cfg.get("title", ""),
            "desc": p_cfg.get("desc", ""),
            "tags": p_cfg.get("tags", []),
            "mode": mode,
            "visibility": p_cfg.get("visibility", "PUBLIC"),
            "tid": p_cfg.get("tid", cfg.get("default_bilibili_tid", 17)),
        })

    if getattr(args, "dry_run", False):
        return {"status": "dry_run", "account": account, "mode": mode, "plan": plan}

    for item in plan:
        if not item["video"] or not os.path.isfile(item["video"]):
            return {"status": "error", "message": f"平台 [{item['platform']}] 视频文件不存在: {item['video']}"}

    from playwright.sync_api import sync_playwright

    results = []
    cn_items = [item for item in plan if item["platform"] in CN_PLATFORMS]
    gl_items = [item for item in plan if item["platform"] in GLOBAL_PLATFORMS]
    headless = getattr(args, "headless", False)

    with sync_playwright() as pw:
        for group_items in [cn_items, gl_items]:
            if not group_items:
                continue
            first_plat = group_items[0]["platform"]
            ctx = launch_edge_context(
                pw,
                ROOT_DIR,
                cfg,
                account,
                first_plat,
                headless=headless,
                proxy_override=getattr(args, "proxy", None),
            )
            for idx, item in enumerate(group_items):
                plat = item["platform"]
                page = ctx.pages[0] if (idx == 0 and ctx.pages) else ctx.new_page()
                try:
                    res = PLATFORM_HANDLERS[plat](page, item)
                except Exception as e:
                    res = {"platform": plat, "status": "error", "message": str(e)}
                results.append(res)

            if mode == "review" and not headless and not getattr(args, "close_after_review", False):
                print(json.dumps({"status": "waiting_user_review", "results": results}, ensure_ascii=False, indent=2), flush=True)
                try:
                    while len(ctx.pages) > 0:
                        time.sleep(1)
                except KeyboardInterrupt:
                    pass
            try:
                ctx.close()
            except Exception:
                pass

    return {"status": "completed", "account": account, "mode": mode, "results": results}


def cmd_publish(args: argparse.Namespace) -> int:
    cfg = load_config()
    if args.spec:
        with open(os.path.abspath(args.spec), "r", encoding="utf-8") as f:
            spec = json.load(f)
    elif args.use_latest:
        latest = find_latest_polo_recording(cfg)
        if not latest:
            print(json.dumps({"status": "error", "message": "未找到已有录制文件夹"}, ensure_ascii=False))
            return 1
        spec = build_auto_copy_from_recording(latest, cfg.get("default_bilibili_tid", 17))
    else:
        if not args.video:
            print(json.dumps({"status": "error", "message": "必须提供 --video、--spec 或 --use-latest"}, ensure_ascii=False))
            return 1
        video_path = os.path.abspath(args.video)
        selected = parse_platforms(args.platforms or "all")
        tags = [t.strip() for t in (args.tags or "").split(",") if t.strip()]
        spec = {
            "video": video_path,
            "cover": args.cover or "",
            "account": args.account or cfg.get("default_account", "default"),
            "mode": args.mode or cfg.get("default_mode", "auto"),
            "platforms": {
                p: {
                    "enabled": True,
                    "video": video_path,
                    "cover": args.cover or "",
                    "title": args.title or os.path.splitext(os.path.basename(video_path))[0],
                    "desc": args.desc or "",
                    "tags": tags,
                }
                for p in selected
            },
        }

    out = execute_publish_from_spec(cfg, spec, args)
    print(json.dumps(out, ensure_ascii=False, indent=2))
    return 0 if out.get("status") in ("completed", "dry_run") else 1


def cmd_auto(args: argparse.Namespace) -> int:
    """
    一句话全自动流水线：
      1. 自动录制 polo-balls 对局（支持右键离线模拟录制 sim 或左键实时录制 live，或复用最新录制 --use-latest）
      2. 自动提取中英双语视频 (中文.mp4 / English.mp4) 与 4 张封面 (9:16 / 16:9)
      3. 自动生成（或合并 --spec 自定义文案）并全自动发布到 7 大平台
    """
    cfg = load_config()
    rec = run_polo_recording(cfg, args)
    if rec.get("status") == "error":
        print(json.dumps({"stage": "record", "result": rec}, ensure_ascii=False, indent=2))
        return 1

    if args.dry_run and rec.get("status") == "dry_run":
        stub_rec = {
            "title_zh": f"{args.team0} vs {args.team1}" if args.battle_type != "armor_showcase" else args.showcase_char,
            "title_en": f"{args.team0} vs {args.team1}",
            "outputs": {"zh": "E:/video-publisher/recordings/demo/中文.mp4", "en": "E:/video-publisher/recordings/demo/English.mp4"},
            "covers": {
                "zh_9x16": "E:/video-publisher/recordings/demo/中文封面_9x16.jpg",
                "zh_16x9": "E:/video-publisher/recordings/demo/中文封面_16x9.jpg",
                "en_9x16": "E:/video-publisher/recordings/demo/English_cover_9x16.jpg",
                "en_16x9": "E:/video-publisher/recordings/demo/English_cover_16x9.jpg",
            },
        }
        auto_spec = build_auto_copy_from_recording(stub_rec, cfg.get("default_bilibili_tid", 17))
        pub_plan = execute_publish_from_spec(cfg, auto_spec, args)
        print(json.dumps({"status": "dry_run", "record_plan": rec, "publish_plan": pub_plan}, ensure_ascii=False, indent=2))
        return 0

    auto_spec = build_auto_copy_from_recording(rec, cfg.get("default_bilibili_tid", 17))
    if args.spec and os.path.isfile(args.spec):
        with open(os.path.abspath(args.spec), "r", encoding="utf-8") as f:
            user_spec = json.load(f)
        for p, p_override in user_spec.get("platforms", {}).items():
            if p in auto_spec["platforms"]:
                for k, v in p_override.items():
                    if v not in ("", None, []):
                        auto_spec["platforms"][p][k] = v

    stamp = int(time.time() * 1000)
    saved_spec_path = os.path.join(ROOT_DIR, "tasks", f"auto_publish_{stamp}.json")
    with open(saved_spec_path, "w", encoding="utf-8") as f:
        json.dump(auto_spec, f, ensure_ascii=False, indent=2)

    pub_res = execute_publish_from_spec(cfg, auto_spec, args)
    final_output = {
        "status": pub_res.get("status"),
        "record": rec,
        "generated_spec": saved_spec_path,
        "publish": pub_res,
    }
    print(json.dumps(final_output, ensure_ascii=False, indent=2))
    return 0 if pub_res.get("status") in ("completed", "dry_run") else 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="vpub", description="Polo-Balls 自动录制 + 7 平台视频全自动发布 CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_status = sub.add_parser("status", help="检查本机环境、录制引擎、代理连通性与最新录像")
    p_status.add_argument("--account", default="", help="账号标识（默认 default）")
    p_status.set_defaults(func=cmd_status)

    p_chars = sub.add_parser("chars", help="列出 polo-balls 所有可用角色名称")
    p_chars.add_argument("--search", default="", help="按关键词筛选角色名")
    p_chars.set_defaults(func=cmd_chars)

    p_rec = sub.add_parser("record", help="自动启动 polo-balls 录制对局（支持 sim 右键离线模拟录制 / live 左键实时录制）")
    p_rec.add_argument("--record-mode", choices=["sim", "live"], default="sim", help="sim=右键离线模拟录制（默认，最快且帧率恒定）；live=左键实时录制")
    p_rec.add_argument("--battle-type", choices=["duel", "armor_showcase"], default="duel", help="duel=普通/多队对战；armor_showcase=MC盔甲架新角色介绍展示")
    p_rec.add_argument("--team0", default="烈焰人", help="左侧队伍阵容，如 '烈焰人' 或 '钻石剑*3,木剑*2' 或 'random*3'")
    p_rec.add_argument("--team1", default="铁傀儡", help="右侧队伍阵容，如 '铁傀儡' 或 'random*3'")
    p_rec.add_argument("--team2", default="", help="可选第三队阵容")
    p_rec.add_argument("--teams-json", default="", help="完整自定义队伍 JSON 数组")
    p_rec.add_argument("--showcase-char", default="烈焰人", help="armor_showcase 模式展示的主角名")
    p_rec.add_argument("--map", default="Map10x10", help="地图名称，默认 Map10x10")
    p_rec.add_argument("--training-mode-type", default="manual", help="manual | rotation | timed | boss")
    p_rec.add_argument("--composition", type=int, default=0, help="0=全景(FULL), 1=跟随(FOLLOW), 2=跟随+小地图(FOLLOW_OVERVIEW)")
    p_rec.add_argument("--tail-seconds", type=float, default=3.5, help="分出胜负后继续录制的秒数，默认 3.5")
    p_rec.add_argument("--max-duration", type=float, default=180.0, help="单局最长录制游戏秒数上限，默认 180")
    p_rec.add_argument("--output-dir", default="", help="自定义录像输出根目录")
    p_rec.add_argument("--use-latest", action="store_true", help="直接读取本机已有的最新录制结果，不重新开局")
    p_rec.add_argument("--dry-run", action="store_true", help="仅输出录制命令与配置计划，不启动游戏")
    p_rec.set_defaults(func=cmd_record)

    p_cover = sub.add_parser("cover", help="调用本机 FFmpeg 提取视频封面图")
    p_cover.add_argument("--video", required=True, help="视频文件路径")
    p_cover.add_argument("--out", default="", help="输出封面 jpg 路径")
    p_cover.add_argument("--time", default="00:00:01", help="截取时间点，默认 00:00:01")
    p_cover.set_defaults(func=cmd_cover)

    p_tpl = sub.add_parser("template", help="生成 7 平台双语文案与封面路由 JSON 模板")
    p_tpl.add_argument("--from-latest", action="store_true", help="直接从最新一局 polo-balls 录像自动提取双语视频与 4 张封面生成模板")
    p_tpl.add_argument("--video", default="", help="单视频文件路径")
    p_tpl.add_argument("--title", default="", help="默认中文对阵标题")
    p_tpl.add_argument("--title-en", default="", help="默认英文对阵标题")
    p_tpl.add_argument("--out", default="", help="输出 JSON 文件路径")
    p_tpl.set_defaults(func=cmd_template)

    p_login = sub.add_parser("login", help="打开本机 Edge 持久化窗口扫码登录各平台")
    p_login.add_argument("platforms", nargs="?", default="all", help="all | cn | global | 逗号分隔平台名")
    p_login.add_argument("--account", default="", help="账号标识（默认 default）")
    p_login.add_argument("--proxy", default=None, help="海外平台代理地址覆盖，如 http://127.0.0.1:7890")
    p_login.set_defaults(func=cmd_login)

    p_pub = sub.add_parser("publish", help="将指定视频或最新 polo-balls 录像全自动发布到 7 大平台")
    p_pub.add_argument("--use-latest", action="store_true", help="直接发布最新一局 polo-balls 双语录像与 4 张封面")
    p_pub.add_argument("--spec", default="", help="7 平台差异化文案与视频路由 JSON 文件")
    p_pub.add_argument("--video", default="", help="单视频文件路径")
    p_pub.add_argument("--cover", default="", help="封面图片路径")
    p_pub.add_argument("--title", default="", help="统一标题")
    p_pub.add_argument("--desc", default="", help="统一简介")
    p_pub.add_argument("--tags", default="", help="逗号分隔标签")
    p_pub.add_argument("--platforms", default="", help="all | cn | global | 逗号分隔平台名")
    p_pub.add_argument("--account", default="", help="账号标识（默认 default）")
    p_pub.add_argument("--mode", choices=["auto", "review"], default="auto", help="auto=全自动点击最终发布按钮（默认）；review=填好表单等人工点确认")
    p_pub.add_argument("--headless", action="store_true", help="后台无头模式运行")
    p_pub.add_argument("--close-after-review", action="store_true", help="review 模式下填完即关闭窗口")
    p_pub.add_argument("--proxy", default=None, help="海外平台代理覆盖")
    p_pub.add_argument("--dry-run", action="store_true", help="仅预检并输出 7 平台发布计划 JSON，不启动浏览器")
    p_pub.set_defaults(func=cmd_publish)

    p_auto = sub.add_parser("auto", help="一句话全自动流水线：自动录制 polo-balls 对局 + 自动双语/封面路由 + 全自动发布到 7 大平台")
    p_auto.add_argument("--record-mode", choices=["sim", "live"], default="sim", help="sim=右键离线模拟录制（默认）；live=左键实时录制")
    p_auto.add_argument("--battle-type", choices=["duel", "armor_showcase"], default="duel", help="duel=普通/多队对战；armor_showcase=MC盔甲架新角色介绍展示")
    p_auto.add_argument("--team0", default="烈焰人", help="左侧队伍阵容，如 '烈焰人' 或 '钻石剑*3' 或 'random*3'")
    p_auto.add_argument("--team1", default="铁傀儡", help="右侧队伍阵容，如 '铁傀儡' 或 'random*3'")
    p_auto.add_argument("--team2", default="", help="可选第三队阵容")
    p_auto.add_argument("--teams-json", default="", help="完整自定义队伍 JSON 数组")
    p_auto.add_argument("--showcase-char", default="烈焰人", help="armor_showcase 模式展示的主角名")
    p_auto.add_argument("--map", default="Map10x10", help="地图名称，默认 Map10x10")
    p_auto.add_argument("--training-mode-type", default="manual", help="manual | rotation | timed | boss")
    p_auto.add_argument("--composition", type=int, default=0, help="0=全景(FULL), 1=跟随(FOLLOW), 2=跟随+小地图(FOLLOW_OVERVIEW)")
    p_auto.add_argument("--tail-seconds", type=float, default=3.5, help="分出胜负后继续录制的秒数，默认 3.5")
    p_auto.add_argument("--max-duration", type=float, default=180.0, help="单局最长录制秒数上限")
    p_auto.add_argument("--output-dir", default="", help="自定义录像输出目录")
    p_auto.add_argument("--use-latest", action="store_true", help="跳过新开局，直接取最新录制好的双语视频全自动发布")
    p_auto.add_argument("--spec", default="", help="可选：AI 定制的 7 平台标题/简介/标签覆盖 JSON")
    p_auto.add_argument("--platforms", default="all", help="all | cn | global | 逗号分隔平台名")
    p_auto.add_argument("--account", default="", help="账号标识（默认 default）")
    p_auto.add_argument("--mode", choices=["auto", "review"], default="auto", help="auto=全自动发布（默认）；review=人工点最后一步")
    p_auto.add_argument("--headless", action="store_true", help="后台无头模式运行浏览器")
    p_auto.add_argument("--proxy", default=None, help="海外平台代理覆盖")
    p_auto.add_argument("--dry-run", action="store_true", help="仅预检并输出录制+发布全流程 JSON 计划")
    p_auto.set_defaults(func=cmd_auto)

    return parser


if __name__ == "__main__":
    parser = build_parser()
    ns = parser.parse_args()
    sys.exit(ns.func(ns))
