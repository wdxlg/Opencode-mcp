extends SceneTree
## Polo-Balls 自动化录制启动器（放置在 E:/video-publisher/polo_record_runner.gd，不修改游戏工程文件）
## 支持两种录制模式：
##   - "sim"（默认，对应游戏内右键离线模拟录制）：使用 Godot.4.7.2.offline.exe 固定帧率时钟与离线音频，按机器算力尽快输出 1080x1920/60fps 中英双语 MP4 与 4 张封面。
##   - "live"（对应游戏内左键实时录制）：按实时倍速对局并录制中英双语 MP4 与 4 张封面。

func _initialize() -> void:
	call_deferred("run")

func _wall_msec() -> int:
	return int(Time.call("get_wall_ticks_msec")) if Time.has_method("get_wall_ticks_msec") else Time.get_ticks_msec()

func _fail_and_quit(result_path: String, msg: String) -> void:
	var err_obj: Dictionary = {"status": "error", "error": msg}
	if not result_path.is_empty():
		var f: FileAccess = FileAccess.open(result_path, FileAccess.WRITE)
		if f != null:
			f.store_string(JSON.stringify(err_obj, "	"))
			f.close()
	print("POLO_RECORD_RESULT ", JSON.stringify(err_obj))
	quit(1)

func run() -> void:
	var user_args: PackedStringArray = OS.get_cmdline_user_args()
	if user_args.is_empty():
		_fail_and_quit("", "缺少录制配置 JSON 路径参数（需在 -- 之后传入）")
		return
	var spec_path: String = user_args[0]
	if not FileAccess.file_exists(spec_path):
		_fail_and_quit("", "找不到录制配置文件: " + spec_path)
		return
	var raw_json: String = FileAccess.get_file_as_string(spec_path)
	var spec: Variant = JSON.parse_string(raw_json)
	if typeof(spec) != TYPE_DICTIONARY:
		_fail_and_quit("", "录制配置文件 JSON 解析失败: " + spec_path)
		return
	var cfg: Dictionary = spec as Dictionary
	var result_path: String = str(cfg.get("result_json", spec_path + ".result.json"))
	var record_mode: String = str(cfg.get("record_mode", "sim")).to_lower()
	var simulated: bool = (record_mode != "live")
	var output_dir: String = str(cfg.get("output_dir", "E:/video-publisher/recordings"))
	DirAccess.make_dir_recursive_absolute(output_dir)

	var game: Node = root.get_node("Game")
	var saved_settings: Dictionary = game.Game_Settings.duplicate(true)
	var saved_stop: bool = game.now_stop_state

	game.Game_Settings.Training_Mode = false
	game.Game_Settings.Training_Mode_Type = str(cfg.get("training_mode_type", "manual"))
	game.Game_Settings.Development_Mode = bool(cfg.get("development_mode", false))
	game.Game_Settings.Map_Background = str(cfg.get("map_background", "blue"))
	game.Game_Settings.Minecraft_Clouds = bool(cfg.get("minecraft_clouds", true))
	game.Game_Settings.Battle_Music = str(cfg.get("battle_music", "none"))
	game.now_stop_state = true

	root.size = Vector2i(540, 960)
	var world: Node = load("res://scenes/world.tscn").instantiate()
	world.tree_entered.connect(func(): current_scene = world, CONNECT_ONE_SHOT)
	root.add_child(world)
	if is_instance_valid(world._mc_prewarmer):
		world._mc_prewarmer.free()

	var map_name: String = str(cfg.get("map", "Map10x10"))
	world.now_choose_map = map_name
	world.refresh_map_presentation()
	if is_instance_valid(world.control) and is_instance_valid(world.control.team):
		world.control.team.hide()

	await process_frame
	await process_frame

	var center: Vector2 = world.return_map_world_rect(world._current_map_node()).get_center()
	var battle_type: String = str(cfg.get("battle_type", "duel")).to_lower()

	if battle_type == "armor_showcase":
		# 盔甲架新角色展示模式：先结清一场前置战斗使胜利铃生效，再放置不死盔甲架触发介绍 HUD
		var role_name: String = str(cfg.get("showcase_char", "烈焰人"))
		await world.create_char("Team0", role_name, center + Vector2(-36, 0))
		await world.create_char("Team1", "木剑", center + Vector2(36, 0))
		await process_frame
		for actor: Node in world._battle_units_cache:
			if actor.Team == "Team1":
				actor.process_mode = Node.PROCESS_MODE_DISABLED
				actor.health = 0
		world._update_manual_victory_bell()
		await world.create_char("Team1", "不死盔甲架", center + Vector2(36, 0))
		await process_frame
	else:
		var teams: Array = cfg.get("teams", [
			{"team": "Team0", "char": "烈焰人", "count": 1},
			{"team": "Team1", "char": "铁傀儡", "count": 1}
		])
		var team_idx: int = 0
		for entry_var: Variant in teams:
			if typeof(entry_var) != TYPE_DICTIONARY:
				continue
			var entry: Dictionary = entry_var as Dictionary
			var t_name: String = str(entry.get("team", "Team%d" % team_idx))
			var c_name: String = str(entry.get("char", "random"))
			var cnt: int = maxi(1, int(entry.get("count", 1)))
			var base_offset_x: float = -42.0 if (team_idx % 2 == 0) else 42.0
			for i: int in range(cnt):
				var spread_y: float = float(i - (cnt - 1) * 0.5) * 22.0
				var pos: Vector2 = center + Vector2(base_offset_x, spread_y)
				if entry.has("x") and entry.has("y"):
					pos = Vector2(float(entry.get("x")), float(entry.get("y")))
				await world.create_char(t_name, c_name, pos)
			team_idx += 1
		await process_frame

	world.refresh_versus_text()
	await process_frame

	var recorder: Node = world.control._battle_record_controls.recorder
	var prefs: RefCounted = recorder.PreferencesScript.new("user://vpub_auto_record.cfg")
	prefs.directory = output_dir
	prefs.tail_seconds = float(cfg.get("tail_seconds", 3.5))
	prefs.composition = int(cfg.get("composition", 0))
	recorder.preferences = prefs

	if not simulated:
		game.now_stop_state = false
		game.stop_background.hide()
		game.stop_text.hide()
		if game.Stop_Override_Tween:
			game.Stop_Override_Tween.kill()

	var NamingScript: Script = load("res://scripts/ui/battle_record_naming.gd")
	var snap: Dictionary = NamingScript.snapshot(world, simulated)
	var title_zh: String = NamingScript.title(snap, "zh")
	var title_en: String = NamingScript.title(snap, "en")

	var started: bool = recorder.start_simulated() if simulated else recorder.start_live()
	if not started:
		_fail_and_quit(result_path, "启动录制失败 (" + record_mode + "): " + recorder.get_last_error())
		return

	var max_game_sec: float = float(cfg.get("max_duration_seconds", 180.0))
	var max_wall_ms: int = int(float(cfg.get("max_wall_seconds", 900.0)) * 1000.0)
	var deadline: int = _wall_msec() + max_wall_ms
	var timed_out: bool = false

	while recorder.is_recording() and _wall_msec() < deadline:
		await process_frame
		if max_game_sec > 0.0 and recorder._game_time >= max_game_sec:
			timed_out = true
			recorder.stop()
			break

	if recorder.is_recording():
		timed_out = true
		recorder.stop()

	var finalize_deadline: int = _wall_msec() + 120000
	while recorder.is_busy() and _wall_msec() < finalize_deadline:
		await process_frame

	var result: Dictionary = {
		"status": "ok" if recorder.get_last_error().is_empty() and recorder.last_outputs.size() > 0 else "error",
		"record_mode": record_mode,
		"title_zh": title_zh,
		"title_en": title_en,
		"frames": recorder._frame_index,
		"duration_seconds": float(recorder._frame_index) / 60.0,
		"timed_out": timed_out,
		"folder": recorder.last_folder,
		"outputs": recorder.last_outputs.duplicate(),
		"covers": recorder.last_covers.duplicate(),
		"warnings": recorder.get_recording_warnings(),
		"error": recorder.get_last_error()
	}

	var out_file: FileAccess = FileAccess.open(result_path, FileAccess.WRITE)
	if out_file != null:
		out_file.store_string(JSON.stringify(result, "	"))
		out_file.close()

	world.queue_free()
	await process_frame
	await process_frame
	game.Game_Settings = saved_settings
	game.now_stop_state = saved_stop
	print("POLO_RECORD_RESULT ", JSON.stringify(result))
	quit(0 if result["status"] == "ok" else 1)
