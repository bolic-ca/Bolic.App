# Sideloading Guide

This guide explains how to install the iOS app on your iPhone without paying for the Apple Developer Program ($100/year).

## Quick Overview

1. **GitHub Actions** builds the IPA automatically
2. **Download** the IPA from EAS
3. **Sideload** using AltStore or Sideloadly
4. **Re-sign** every 7 days (free Apple ID limitation)

## Step 1: Set Up GitHub Actions

### Required Secret
Add your Expo token to GitHub repository secrets:

1. Get your Expo token:
   ```bash
   npx expo login
   npx eas whoami
   npx eas token:create
   ```

2. Add to GitHub:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: [paste your token]

### Trigger a Build

Builds automatically run on push to `main` or `integration` branches.

Or manually trigger:
- Go to Actions tab → "Build iOS & Android" → "Run workflow"

## Step 2: Download the IPA

After the build completes (15-20 minutes):

1. Go to https://expo.dev
2. Navigate to your project → Builds
3. Find the latest iOS build
4. Click "Download" to get the `.ipa` file

## Step 3: Sideload to Your iPhone

### Option A: AltStore (Recommended)
**Free, wireless, auto-refresh**

1. Download AltServer from https://altstore.io
2. Install AltStore on your iPhone via AltServer (follow their guide)
3. Open AltStore on iPhone → My Apps → + → Select the IPA
4. AltStore will auto-refresh every 7 days when on same WiFi

### Option B: Sideloadly
**Free, wired connection**

1. Download from https://sideloadly.io
2. Connect iPhone via USB
3. Drag IPA into Sideloadly
4. Enter Apple ID and click Start
5. Manually re-sideload every 7 days

### Option C: TrollStore (If Available)
**Permanent install, no 7-day limit**

Only works on specific iOS versions (check trollstore.app for compatibility):
- Install TrollStore
- Open IPA with TrollStore
- No re-signing needed!

## Step 4: Trust the Certificate

First time installing:
1. Go to Settings → General → VPN & Device Management
2. Tap your Apple ID
3. Tap "Trust"

## Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Ensure `EXPO_TOKEN` secret is set correctly
- Verify `eas.json` configuration

### "Untrusted Developer"
- Go to Settings → General → VPN & Device Management
- Trust your Apple ID certificate

### App Crashes on Launch
- Make sure you downloaded the **iOS** build, not Android
- Try rebuilding with `eas build --platform ios --profile preview --clear-cache`

### Re-signing Expired (7 days)
- Download the IPA again from EAS (same build works)
- Or trigger a new build in GitHub Actions
- Sideload again with AltStore/Sideloadly

## Build Profiles Explained

From `eas.json`:

- **preview** (for sideloading): Creates internal distribution IPA/APK
  - iOS: Archive build suitable for sideloading
  - Android: APK file for direct install

- **development**: Development client with hot reload

- **production**: For App Store/Play Store submission

## Cost Comparison

| Method | Cost | Re-sign Frequency |
|--------|------|-------------------|
| Free Apple ID + Sideloading | $0 | Every 7 days |
| Apple Developer Program | $100/year | Never |
| TrollStore (if compatible) | $0 | Never |

## Resources

- [AltStore Setup Guide](https://altstore.io)
- [Sideloadly Guide](https://sideloadly.io)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [TrollStore Compatibility](https://ios.cfw.guide/installing-trollstore/)
