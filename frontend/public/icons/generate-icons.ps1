# PWA Icon Generator Script
# Run this to generate all required PWA icons from a source image

# Using ImageMagick (install: choco install imagemagick or download from imagemagick.org)
# Or use an online tool like https://www.pwabuilder.com/imageGenerator

# If you have ImageMagick installed, run:
# convert icon-base.svg -resize 72x72 icon-72x72.png
# convert icon-base.svg -resize 96x96 icon-96x96.png
# convert icon-base.svg -resize 128x128 icon-128x128.png
# convert icon-base.svg -resize 144x144 icon-144x144.png
# convert icon-base.svg -resize 152x152 icon-152x152.png
# convert icon-base.svg -resize 192x192 icon-192x192.png
# convert icon-base.svg -resize 384x384 icon-384x384.png
# convert icon-base.svg -resize 512x512 icon-512x512.png

# Quick PNG generation using PowerShell and .NET (no external tools needed)
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

Write-Host "Generating PWA icons..." -ForegroundColor Cyan

Add-Type -AssemblyName System.Drawing

# Create a simple app icon (blue gradient with text)
foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Enable anti-aliasing
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Create gradient background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $startColor = [System.Drawing.Color]::FromArgb(99, 102, 241)  # Indigo
    $endColor = [System.Drawing.Color]::FromArgb(59, 130, 246)    # Blue
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $startColor, $endColor, 45)
    
    # Fill background
    $graphics.FillRectangle($brush, $rect)
    
    # Add text
    $fontSize = [Math]::Floor($size / 4)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = [System.Drawing.Brushes]::White
    $text = "IP"
    
    # Center text
    $stringFormat = New-Object System.Drawing.StringFormat
    $stringFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $stringFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $graphics.DrawString($text, $font, $textBrush, $rect, $stringFormat)
    
    # Save
    $outputPath = "icon-${size}x${size}.png"
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    Write-Host "Created: $outputPath" -ForegroundColor Green
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $font.Dispose()
    $brush.Dispose()
}

Write-Host "`nAll icons generated successfully!" -ForegroundColor Green
Write-Host "Icons are ready for PWA installation." -ForegroundColor Cyan
