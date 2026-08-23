Add-Type -AssemblyName System.Drawing

$srcPath = "D:\restinpeace\cafe-frontend\public\logo.png"
$resDir = "D:\restinpeace\cafe-frontend\android\app\src\main\res"

$sizes = @(
    @{ folder = "mipmap-mdpi"; icon = 48; fg = 108 },
    @{ folder = "mipmap-hdpi"; icon = 72; fg = 162 },
    @{ folder = "mipmap-xhdpi"; icon = 96; fg = 216 },
    @{ folder = "mipmap-xxhdpi"; icon = 144; fg = 324 },
    @{ folder = "mipmap-xxxhdpi"; icon = 192; fg = 432 }
)

# Render centered logo with safe-zone padding to prevent any edge clipping
function Render-Centered-Icon($src, $canvasSize, $scalePercent, $bgColor, $dest) {
    $bmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    if ($bgColor -ne $null) {
        $g.Clear($bgColor)
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }
    
    $targetW = [Math]::Round($canvasSize * $scalePercent)
    $targetH = [Math]::Round($canvasSize * $scalePercent)
    $offsetX = [Math]::Round(($canvasSize - $targetW) / 2)
    $offsetY = [Math]::Round(($canvasSize - $targetH) / 2)
    
    $g.DrawImage($src, $offsetX, $offsetY, $targetW, $targetH)
    $g.Dispose()
    
    if (Test-Path $dest) {
        Remove-Item $dest -Force
    }
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)
$brandBgColor = [System.Drawing.ColorTranslator]::FromHtml("#07060A")

foreach ($item in $sizes) {
    $targetDir = Join-Path $resDir $item.folder
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    # Standard launcher icon (78% logo + 22% padding with dark background)
    $iconDest = Join-Path $targetDir "ic_launcher.png"
    Render-Centered-Icon $srcImage $item.icon 0.78 $brandBgColor $iconDest

    # Round launcher icon (75% logo + 25% padding with dark background)
    $roundDest = Join-Path $targetDir "ic_launcher_round.png"
    Render-Centered-Icon $srcImage $item.icon 0.75 $brandBgColor $roundDest

    # Android Adaptive Foreground icon (60% safe zone to never get cropped by circles/squircles)
    $fgDest = Join-Path $targetDir "ic_launcher_foreground.png"
    Render-Centered-Icon $srcImage $item.fg 0.60 $null $fgDest

    Write-Host "Generated perfectly fitted icons for $($item.folder)"
}

$srcImage.Dispose()
Write-Host "All Android cafe logo icons fitted and generated with safe-zone margins!"
