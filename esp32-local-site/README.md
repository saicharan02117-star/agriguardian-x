# AgriGuardian X — local ESP32 camera website

This dashboard is designed to be served from the ESP32 camera's local Wi-Fi network. It does not use rover movement, servo, connect/disconnect or motor-control endpoints.

## Local URLs

- Website: `http://192.168.4.1/`
- Crop-camera MJPEG stream: `http://192.168.4.1:81/stream`
- Single JPEG screenshot: `http://192.168.4.1/capture`

The address assumes the ESP32 runs as a Wi-Fi access point with the normal gateway `192.168.4.1`. If the module joins a router, replace this address with the IP printed by the ESP32 serial monitor.

## Camera API contract

`GET /capture` must return one current frame with `Content-Type: image/jpeg`.

`GET /stream` on port `81` must return the normal multipart MJPEG stream used by the Espressif CameraWebServer example.

When the website is served by the same ESP32, the browser uses a local, same-device connection and no cloud API is required. If testing the UI from another origin, add these response headers to the camera handlers:

```text
Access-Control-Allow-Origin: *
Cache-Control: no-store
```

## Prepare the website for LittleFS

From the repository root, run:

```bash
node scripts/build-esp32-local-site.mjs
```

Upload the generated `esp32-local-site/data` directory to the ESP32-S3 LittleFS partition and configure the camera server to:

1. Redirect `/` to `/vjh/` or serve `/index.html`.
2. Serve files from LittleFS using their request path.
3. Keep the camera stream on port `81`.
4. Keep the one-frame camera endpoint at `/capture` on port `80`.

The Crop Health page uses the screenshot from `/capture` as its active plant image and runs the browser-side screening automatically.

## Soil screenshot rule

The soil feature accepts a photo or screenshot of a laboratory soil-test report or a sensor display. Where the browser provides an offline `TextDetector`, labelled pH, moisture, temperature, EC, N, P and K values are filled automatically. Otherwise the same screenshot stays visible while the farmer enters the values manually.

A photograph of soil itself cannot accurately measure pH, NPK, EC, moisture or temperature, so the interface never claims to extract those measurements from soil colour.
