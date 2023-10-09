#!/bin/bash

# Remove the "dist" directory if it exists
if [ -d "../dist" ]; then
  rm -rf dist
fi

# Compile TypeScript code using tsc
tsc

# Check if the "dist" directory exists after compilation
if [ -d "dist" ]; then
  echo "Build successful!"
else
  echo "Build failed."
fi
