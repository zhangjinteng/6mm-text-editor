.DEFAULT_GOAL := dev

PNPM ?= pnpm
PORT ?= 5184
PROJECT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
PROJECT_ROOT := $(realpath $(PROJECT_DIR))

.PHONY: dev start stop free-port

dev: free-port
	$(PNPM) --dir "$(PROJECT_DIR)" run dev --port $(PORT) --strictPort

start: dev

stop: free-port

# Only stop Vite processes owned by this project, never unrelated listeners.
free-port:
	@set -eu; \
	port="$(PORT)"; \
	case "$$port" in ''|*[!0-9]*) echo "Invalid PORT: $$port" >&2; exit 1 ;; esac; \
	if [ "$${#port}" -gt 5 ] || [ "$$port" -lt 1 ] || [ "$$port" -gt 65535 ]; then echo "Invalid PORT: $$port" >&2; exit 1; fi; \
	command -v lsof >/dev/null || { echo "lsof is required to check port $$port" >&2; exit 1; }; \
	pids=$$(lsof -nP -t -iTCP:$$port -sTCP:LISTEN 2>/dev/null | sort -u); \
	if [ -z "$$pids" ]; then exit 0; fi; \
	for pid in $$pids; do \
		cwd=$$(lsof -a -p $$pid -d cwd -Fn 2>/dev/null | sed -n 's/^n//p'); \
		cmd=$$(ps -p $$pid -o command=); \
		if [ "$$cwd" != "$(PROJECT_ROOT)" ]; then echo "Port $$port is occupied by another program (PID $$pid); not stopped. Use PORT=5185 or stop it manually." >&2; exit 1; fi; \
		case "$$cmd" in *node_modules/.bin/vite*|*node_modules/*vite*/bin/vite.js*) ;; *) echo "Port $$port is occupied by a non-Vite process (PID $$pid); not stopped." >&2; exit 1 ;; esac; \
	done; \
	for pid in $$pids; do echo "Stopping existing project Vite (PID $$pid, port $$port)..."; kill -TERM $$pid; done; \
	i=0; \
	while lsof -nP -t -iTCP:$$port -sTCP:LISTEN >/dev/null 2>&1; do \
		if [ $$i -ge 50 ]; then echo "Port $$port is still occupied after 5 seconds; startup cancelled." >&2; exit 1; fi; \
		sleep 0.1; i=$$((i + 1)); \
	done
