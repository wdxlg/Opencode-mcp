"""OpenCode: Windows-MCP direct control with the original on-screen indicator.

OpenCode puts this directory on PYTHONPATH only for the windows-mcp stdio
server and sets OPENCODE_WINDOWS_MCP_DIRECT=1.

Upstream windows-mcp 0.8.8 blocks desktop tools for 3 seconds after physical
input (USER_CONTROL), preempts the AI when the mouse moves, and swallows the
user's input while the AI acts.  In direct mode:

* the AI is never blocked or preempted, and the user's input is never swallowed;
* the upstream physical-input hooks stay installed, only to sense user activity
  and to keep the upstream exit chord working;
* the upstream indicator (screen-edge glow + top-center exit notice) is shown
  whenever windows-mcp is in use (a tool call is running, or less than 15 s
  since the last one ended): blue when the user has not touched mouse/keyboard
  for 3 s (AI fully in control), amber when the user did within 3 s.

Set OPENCODE_WINDOWS_MCP_DIRECT=0 in the server environment to restore
upstream behaviour.
"""

import os
import sys

_TARGET = "windows_mcp.desktop.control"
_IDLE_SECONDS = 3.0
_IN_USE_LEASE_SECONDS = 15.0
_POLL_SECONDS = 0.1


def _log(message):
    try:
        sys.stderr.write("[opencode] windows-mcp direct: %s\n" % (message,))
    except Exception:
        pass


def _patch(module):
    coordinator = getattr(module, "ControlCoordinator", None)
    if coordinator is None or getattr(coordinator, "_opencode_direct", False):
        return

    import threading
    import time

    original_start = coordinator.start
    original_stop = coordinator.stop
    original_handle = coordinator._handle

    # Never swallow physical input: hooks only pass input through when
    # _suppress is false, so pin it false for every instance.
    coordinator._suppress = property(lambda self: False, lambda self, value: None)

    def _ocd_init(self):
        if getattr(self, "_ocd_ready", False):
            return
        self._ocd_lock = threading.RLock()
        self._ocd_shown = None
        self._ocd_lease = 0.0
        self._ocd_stop = threading.Event()
        self._ocd_thread = None
        self._ocd_failures = 0
        self._ocd_ready = True

    def _ocd_wanted(self, now):
        in_use = self._active_calls > 0 or now < self._ocd_lease
        last = self._last_physical_event
        user_recent = last > 0 and now - last < _IDLE_SECONDS
        return in_use, bool(in_use and user_recent)

    def _ocd_refresh(self):
        _ocd_init(self)
        try:
            from windows_mcp.desktop import control_overlay
        except Exception as exc:
            if not self._ocd_failures:
                _log("indicator unavailable: %r" % (exc,))
            self._ocd_failures += 1
            return
        with self._ocd_lock:
            wanted = _ocd_wanted(self, time.monotonic())
            # Read what the indicator really shows: upstream listeners may
            # also hide it (e.g. after a hook fault), so never trust a cache.
            indicator = getattr(control_overlay, "_instance", None)
            if indicator is None:
                shown = (False, False)
            else:
                shown = (bool(indicator.active), bool(indicator.active and indicator.pending))
            if wanted == shown:
                self._ocd_shown = wanted
                return
            in_use, pending = wanted
            try:
                if not in_use:
                    control_overlay.set_active(False)
                else:
                    if not shown[0]:
                        control_overlay.set_active(True)
                    if shown[1] != pending:
                        control_overlay.set_pending(pending)
                self._ocd_shown = wanted
                self._ocd_failures = 0
            except Exception as exc:
                if not self._ocd_failures:
                    _log("indicator update failed: %r" % (exc,))
                self._ocd_failures += 1
                self._ocd_shown = None

    def _ocd_loop(self):
        while not self._ocd_stop.wait(_POLL_SECONDS):
            _ocd_refresh(self)
            if self._ocd_failures:
                # Back off while the indicator owner is unhealthy.
                self._ocd_stop.wait(min(5.0, 0.5 * self._ocd_failures))

    def start(self):
        _ocd_init(self)
        try:
            original_start(self)
        except Exception as exc:
            _log("physical input monitor unavailable, continuing without it: %r" % (exc,))
        with self._lock:
            self._emergency = False
            self._fast_takeover = False
            self._fast_pending = False
            self.input_ledger._blocked = False
            self._state = "ready"
        self._ready.set()
        self._ocd_stop.clear()
        if self._ocd_thread is None or not self._ocd_thread.is_alive():
            self._ocd_thread = threading.Thread(
                target=_ocd_loop, args=(self,), name="opencode-direct-indicator", daemon=True
            )
            self._ocd_thread.start()

    def stop(self):
        _ocd_init(self)
        self._ocd_stop.set()
        if self._ocd_thread is not None:
            self._ocd_thread.join(timeout=1.0)
        try:
            from windows_mcp.desktop import control_overlay

            control_overlay.set_active(False)
        except Exception:
            pass
        try:
            original_stop(self)
        except Exception as exc:
            _log("stop: %r" % (exc,))
            try:
                self.input_ledger.release_all()
            except Exception:
                pass

    def status(self):
        _ocd_init(self)
        now = time.monotonic()
        with self._lock:
            in_use, user_recent = _ocd_wanted(self, now)
            return {
                "state": "ai" if in_use else "ready",
                "generation": self._generation,
                "wait_seconds": 0.0,
                "mode": "opencode-direct",
                "indicator": ("amber" if user_recent else "blue") if in_use else "hidden",
            }

    def begin_call(self, name):
        _ocd_init(self)
        with self._lock:
            self._active_calls += 1
            self._state = "ai"
            self.input_ledger._blocked = False
            token = self._generation
        _ocd_refresh(self)
        return token

    def end_call(self, token):
        _ocd_init(self)
        with self._lock:
            self._active_calls = max(0, self._active_calls - 1)
            if not self._active_calls:
                self._ocd_lease = time.monotonic() + _IN_USE_LEASE_SECONDS
                self._state = "ready"

    def _handle(self, event):
        # Only the upstream exit chord keeps its effect; user activity no
        # longer changes control state (the indicator thread reads it).
        if event and event[0] == "exit":
            return original_handle(self, event)
        return None

    def _noop(self, *args, **kwargs):
        return None

    coordinator.start = start
    coordinator.stop = stop
    coordinator.status = status
    coordinator.begin_call = begin_call
    coordinator.end_call = end_call
    coordinator._handle = _handle
    coordinator._tick_locked = lambda self, now: False
    coordinator.checkpoint = _noop
    coordinator.arm_visible = _noop
    coordinator.resume_after_capture = _noop
    coordinator.pause_for_capture = lambda self: None
    coordinator.visible_ack_required = lambda self: False
    coordinator._opencode_direct = True
    _log("enabled (no idle wait, no takeover, indicator blue/amber while in use)")


def _install():
    if os.environ.get("OPENCODE_WINDOWS_MCP_DIRECT") != "1":
        return
    import importlib.abc
    import importlib.machinery

    class _DirectFinder(importlib.abc.MetaPathFinder):
        def find_spec(self, name, path, target=None):
            if name != _TARGET:
                return None
            spec = importlib.machinery.PathFinder.find_spec(name, path)
            if spec is None or spec.loader is None or not hasattr(spec.loader, "exec_module"):
                return spec
            original = spec.loader.exec_module

            def exec_module(module, _original=original):
                _original(module)
                try:
                    _patch(module)
                except Exception as exc:
                    _log("patch failed: %r" % (exc,))

            spec.loader.exec_module = exec_module
            return spec

    sys.meta_path.insert(0, _DirectFinder())
    loaded = sys.modules.get(_TARGET)
    if loaded is not None:
        _patch(loaded)


_install()
