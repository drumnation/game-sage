#!/bin/bash

# Start the dev server in the background
pnpm dev &

# Wait for the dev server to be ready
while ! nc -z localhost 5174; do   
  sleep 0.1
done

# Run the tests
if [ "$1" = "--ui" ]; then
    playwright test --ui
elif [ "$1" = "--debug" ]; then
    playwright test --debug
else
    playwright test
fi

# Kill the dev server
kill %1 