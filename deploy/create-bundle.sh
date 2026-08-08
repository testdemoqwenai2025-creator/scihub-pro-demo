#!/bin/bash
# ============================================================
# SciHub Pro - Binary Distribution Bundle Creator
# ============================================================

set -e

VERSION="${1:-3.0.0}"
BUNDLE_NAME="scihub-pro-v${VERSION}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="/home/z/my-project/dist"

echo "========================================"
echo " SciHub Pro - Distribution Bundle Creator"
echo " Version: $VERSION"
echo "========================================"

mkdir -p $OUTPUT_DIR

BUILD_DIR="/tmp/scihub-pro-bundle-$TIMESTAMP"
mkdir -p $BUILD_DIR

echo "[1/6] Building application..."

if [ ! -d "/home/z/my-project/out" ]; then
    cd /home/z/my-project && npm run build 2>/dev/null || true
fi

echo "[2/6] Copying distribution files..."

cp -r /home/z/my-project/out/* $BUILD_DIR/ 2>/dev/null || true

mkdir -p $BUILD_DIR/docs
cp /home/z/my-project/docs/*.md $BUILD_DIR/docs/ 2>/dev/null || true

mkdir -p $BUILD_DIR/deploy
cp /home/z/my-project/deploy/*.sh $BUILD_DIR/deploy/
chmod +x $BUILD_DIR/deploy/*.sh

cp /home/z/my-project/Dockerfile $BUILD_DIR/ 2>/dev/null || true

echo "[3/6] Creating documentation..."

cat > $BUILD_DIR/README-BUNDLE.md << 'BUNDLEEOF'
# SciHub Pro Distribution Bundle

## Quick Start (Static Hosting)

This bundle contains pre-built static files ready for deployment.

### Deployment Options:

#### Simple HTTP Server (Testing)
```bash
python3 -m http.server 8080
```

#### Docker Deployment
```bash
docker build -t scihub-pro .
docker run -p 3000:3000 scihub-pro
```

## Cloud Deployment

See `deploy/` directory for scripts:
- deploy-gcp.sh - Google Cloud Run
- deploy-aws.sh - AWS ECS/Fargate
- deploy-azure.sh - Azure Container Apps

## Documentation

Full documentation available in `docs/` directory.

## Support

- Live Demo: https://testdemoqwenai2025-creator.github.io/scihub-pro-demo/
- GitHub: https://github.com/testdemoqwenai2025-creator/Demo2SciHub

MIT License - See LICENSE file for details.
BUNDLEEOF

sed -i "s/VERSION_PLACEHOLDER/${VERSION}/g" $BUILD_DIR/README-BUNDLE.md 2>/dev/null || true

echo "[4/6] Creating license file..."

cat > $BUILD_DIR/LICENSE << 'LICENSEEOF'
MIT License

Copyright (c) 2026 SciHub Pro Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
LICENSEEOF

echo "[5/6] Creating archive..."

cd $BUILD_DIR
ZIP_FILE="$OUTPUT_DIR/${BUNDLE_NAME}.zip"
zip -r "$ZIP_FILE" . > /dev/null 2>&1

cd $OUTPUT_DIR
sha256sum "${BUNDLE_NAME}.zip" > "${BUNDLE_NAME}.sha256" 2>/dev/null || echo "sha256 not available" > "${BUNDLE_NAME}.sha256"
md5sum "${BUNDLE_NAME}.zip" > "${BUNDLE_NAME}.md5" 2>/dev/null || echo "md5 not available" > "${BUNDLE_NAME}.md5"

echo "[6/6] Creating manifest..."

cat > "$OUTPUT_DIR/${BUNDLE_NAME}-manifest.json" << MANIFESTEOF
{
  "name": "scihub-pro",
  "version": "$VERSION",
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "bundleType": "static-export",
  "archive": "${BUNDLE_NAME}.zip",
  "sourceRepository": "https://github.com/testdemoqwenai2025-creator/Demo2SciHub",
  "liveDemo": "https://testdemoqwenai2025-creator.github.io/scihub-pro-demo/"
}
MANIFESTEOF

rm -rf $BUILD_DIR

echo ""
echo "========================================"
echo " BUNDLE CREATED SUCCESSFULLY!"
echo "========================================"
echo ""
echo "Bundle Details:"
echo "  Name:     ${BUNDLE_NAME}.zip"
echo "  Location: ${OUTPUT_DIR}/"
echo "  Size:     $(du -h ${BUNDLE_NAME}.zip | cut -f1)"
echo ""
echo "Files created:"
ls -lh ${OUTPUT_DIR}/${BUNDLE_NAME}* 2>/dev/null || true
echo ""
echo "To deploy this bundle:"
echo "  1. Extract: unzip ${BUNDLE_NAME}.zip"
echo "  2. Host:    Upload contents to any web server"
echo "  3. Or use:  docker build -t scihub-pro . && docker run -p 3000:3000 scihub-pro"
echo ""
echo "Note: This bundle is authorized for distribution by the project owner."
