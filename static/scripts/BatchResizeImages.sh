#!/usr/bin/env fish

# Check arguments
if test (count $argv) -lt 2; or test (count $argv) -gt 3
    echo "Usage: ./batch_resize.sh <root_folder> <max_dimension> [use_webp]"
    echo "Example: ./batch_resize.sh ~/Pictures 1920"
    echo "Example with WebP: ./batch_resize.sh ~/Pictures 1920 webp"
    exit 1
end

set root_folder (realpath $argv[1])
set max_size $argv[2]
set use_webp 0
if test (count $argv) -eq 3; and test $argv[3] = "webp"
    set use_webp 1
end

# Check if root folder exists
if not test -d "$root_folder"
    echo "Error: Directory '$root_folder' does not exist"
    exit 1
end

# Check if ImageMagick is installed
if not command -v convert > /dev/null
    echo "Error: ImageMagick is not installed. Please install it first."
    exit 1
end

# Remove existing dimension folders
find "$root_folder" -type d -name "$max_size" -exec rm -rf {} +

# Find all image files recursively from the root folder and resize them
for img in (find "$root_folder" -type f -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif")
    set filename (basename "$img")
    set directory (dirname "$img")
    
    # Create dimension directory if it doesn't exist
    mkdir -p "$directory/$max_size"
    
    echo "Processing: $img"
    
    if test $use_webp -eq 1
        # Get filename without extension and append .webp
        set filename_base (string replace -r '\.[^.]*$' '' $filename)
        set output_path "$directory/$max_size/$filename_base.webp"
        
        # Resize and convert to WebP
        convert "$img" -resize "$max_size"x"$max_size"\> -quality 90 "$output_path"
    else
        # Regular resize without format conversion
        convert "$img" -resize "$max_size"x"$max_size"\> "$directory/$max_size/$filename"
    end
    
    if test $status -eq 0
        echo "Successfully processed: $filename"
    else
        echo "Failed to process: $filename"
    end
end

if test $use_webp -eq 1
    echo "Resizing complete! Resized WebP images are in '$max_size' folders"
else
    echo "Resizing complete! Resized images are in '$max_size' folders"
end




