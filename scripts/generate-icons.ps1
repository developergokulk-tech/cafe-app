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

function Resize-Image($src, $w, $h, $dest) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    $g.DrawImage($src, 0, 0, $w, $h)
    $g.Dispose()
    
    if (Test-Path $dest) {
        Remove-Item $dest -Force
    }
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)

foreach ($item in $sizes) {
    $targetDir = Join-Path $resDir $item.folder
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    # Generate standard icon
    $iconDest = Join-Path $targetDir "ic_launcher.png"
    Resize-Image $srcImage $item.icon $item.icon $iconDest

    # Generate round icon
    $roundDest = Join-Path $targetDir "ic_launcher_round.png"
    Resize-Image $srcImage $item.icon $item.icon $roundDest

    # Generate adaptive foreground icon
    $fgDest = Join-Path $targetDir "ic_launcher_foreground.png"
    Resize-Image $srcImage $item.fg $item.fg $fgDest

    Write-Host "Generated icons for $($item.folder)"
}

$srcImage.Dispose()
Write-Host "All Android cafe logo app icons generated successfully!"
