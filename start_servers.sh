#!/bin/bash

start_servers() {
	echo "Starting servers..."
	cd tilserver/tileserver-gl
	node . -p 9999 | while read line; do echo "[Server 1] $line"; done &
	SERVER1_PID=$!
	cd ../../src/server
	node server.js | while read line; do echo "[Server 2] $line"; done &
	SERVER2_PID=$!
	echo "Servers started."
}

stop_servers() {
	echo "Stopping servers..."
	if [ -n "$SERVER1_PID" ]; then
		kill "$SERVER1_PID" && echo "Server 1 stopped." || echo "Failed to stop Server 1."
	fi
	if [ -n "$SERVER2_PID" ]; then
		kill "$SERVER2_PID" && echo "Server 2 stopped." || echo "Failed to stop Server 2,"
	fi
}

trap stop_servers INT
start_servers

echo "Servers are running. Press Ctrl+C to stop."
wait


