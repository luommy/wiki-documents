#!/bin/bash

# Image Upload Tool Convenience Script
# Run this script from project root directory, automatically switches to .image-upload directory and executes the upload tool

# Switch to .image-upload directory
cd "$(dirname "$0")" || exit 1

# Execute upload-images script, passing all arguments
yarn upload-images "$@"
