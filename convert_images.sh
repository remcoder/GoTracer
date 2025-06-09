#!/bin/bash

# Directory containing images
DIR="public/images/examples"

# Counter for sequential naming
COUNT=1

# Process each image file
for file in "$DIR"/*.webp; do
  if [[ -f "$file" ]]; then
    # New filename
    new_name="$DIR/goban$COUNT.png"

    # Convert to PNG
    /opt/homebrew/bin/convert "$file" "$new_name"

    # Verify conversion was successful
    if [[ $? -eq 0 ]]; then
      echo "Converted $file to $new_name"
      ((COUNT++))
      
      # Remove original webp file
      rm "$file"
    else
      echo "Failed to convert $file"
    fi
  fi
done

echo "Conversion complete. Processed $((COUNT-1)) files."
