# ESP32 Storage Telemetry Hardware & Setup Guide

## Overview

Phase 6 introduces real-time environmental storage monitoring using an **ESP32 DevKit v1** microcontroller equipped with temperature and humidity sensors, with optional carbon dioxide ($\text{CO}_2$) sensing capabilities.

The microcontroller periodically acquires sensory telemetry and transmits structured JSON packets to the backend via HTTP POST to verify that actual warehousing conditions remain compatible with the assumptions made during packaging recommendation analysis.

---

## 1. Hardware Requirements

| Component | Role | Recommended Model | Notes |
|:---|:---|:---|:---|
| **Microcontroller** | Processing & Wi-Fi Client | ESP32-WROOM-32 / DevKit v1 | 2.4 GHz 802.11 b/g/n Wi-Fi |
| **Primary Sensor** | Temperature & Relative Humidity | DHT22 (AM2302) or SHT31 / BME280 | Digital 1-wire / I2C interface |
| **Secondary Sensor (Optional)** | Carbon Dioxide ($\text{CO}_2$) | Sensirion SCD30 / MQ-135 | NDIR optical or analog MOX |
| **Power Supply** | Node Power | Micro-USB (5V / 1A) | Standard 5V USB wall adapter |
| **Jumper Wires & Breadboard** | Prototyping | Standard Dupont wires | Pull-up resistor (4.7kΩ–10kΩ) for DHT |

---

## 2. Pinout & Wiring Diagram

### ASCII Wiring Schematic (ESP32 with DHT22):

```
+-------------------------------------------------------------+
|                          ESP32 DEVKIT                        |
|                                                             |
|   [ 3V3 ] ------------------------+ (3.3V Power)            |
|   [ GND ] -------------------+    |                         |
|   [ D4  ] (GPIO 4) ------+   |    |                         |
+--------------------------|---|----|-------------------------+
                           |   |    |
                           |   |    +------> [ Pin 1: VCC ]   DHT22 Sensor
                           |   |             [ Pin 2: DATA ] -+
                           +---|------------------------------+
                               |             [ Pin 3: NC ]
                               +-----------> [ Pin 4: GND ]
                               |
                        [ 10kΩ Resistor ] (Between VCC and DATA)
```

### Optional $\text{CO}_2$ Sensor Connection:
- If utilizing an analog gas sensor (e.g. MQ-135):
  - `VCC` $\rightarrow$ `VIN` (5V)
  - `GND` $\rightarrow$ `GND`
  - `AOUT` $\rightarrow$ `GPIO 34` (Analog Input ADC1)
- If unpopulated, the firmware automatically transmits `"co2": null`. The web dashboard surfaces **"CO₂ sensor unavailable"** without fabricating data.

---

## 3. Firmware Configuration (`config.h`)

The firmware avoids hardcoding credentials. Configuration is separated into a dedicated header:

1. Copy the example configuration template:
   ```bash
   cp iot/esp32/config.h.example iot/esp32/config.h
   ```
2. Open `iot/esp32/config.h` and configure your local network settings:
   ```cpp
   #define WIFI_SSID           "YourNetworkName"
   #define WIFI_PASSWORD       "YourNetworkPassword"

   #define SERVER_HOST         "192.168.1.50"   // IP of computer running Flask server
   #define SERVER_PORT         5000
   #define SERVER_ENDPOINT     "/api/iot/readings"

   #define DEVICE_ID           "ESP32-COLDCHAIN-01"
   #define ANALYSIS_ID         1                 // Linked recommendation analysis ID
   ```

---

## 4. Compiling & Flashing Firmware

### Using Arduino IDE:
1. Install the **ESP32 Board Package**:
   - Go to `File` $\rightarrow$ `Preferences`.
   - Add URL to Additional Board Manager URLs:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Open `Tools` $\rightarrow$ `Board` $\rightarrow$ `Boards Manager`, search for `esp32` by Espressif Systems, and click **Install**.
2. Select Board: `Tools` $\rightarrow$ `Board` $\rightarrow$ `ESP32 Arduino` $\rightarrow$ `DOIT ESP32 DEVKIT V1`.
3. Open `iot/esp32/smart_packaging_esp32.ino`.
4. Click **Upload**.
5. Open the Serial Monitor (`115200 baud`) to verify Wi-Fi connection and successful HTTP transmission.

---

## 5. Local Simulator (No Hardware Required)

For rapid development and automated testing without physical hardware, run the included simulator:

```bash
# Transmit a single normal reading
python scripts/simulate_iot.py

# Simulate temperature drift (Watch status)
python scripts/simulate_iot.py --mode watch --temp 8.2

# Simulate severe temperature abuse (Warning status)
python scripts/simulate_iot.py --mode warning --temp 18.0

# Continuous streaming every 5 seconds
python scripts/simulate_iot.py --continuous --interval 5
```

All simulated packets are explicitly stamped `"source": "SIMULATED SENSOR DATA"` to maintain strict separation from physical observations.

---

## 6. Troubleshooting

| Symptom | Probable Cause | Corrective Action |
|:---|:---|:---|
| **HTTP Connection Refused** | Server not running or firewall blocking port 5000 | Ensure Flask is running (`python run.py`) and listening on `0.0.0.0` or local subnet. Check firewall rules. |
| **HTTP 400 Validation Error** | Malformed JSON or out-of-bounds sensor values | Verify baud rate and check that temperature ($-50$ to $100^\circ\text{C}$) and humidity ($0$ to $100\%$) are valid numbers. |
| **Wi-Fi Disconnect Loops** | Weak signal or incorrect 2.4 GHz credentials | Ensure credentials are correct. Note: ESP32 only connects to 2.4 GHz Wi-Fi networks (not 5 GHz). |
| **"Sensor Unavailable" on Dashboard** | Expected behavior when CO₂ pin is disabled | If no CO₂ sensor is connected, this is normal and displays transparently to prevent fabricated metrics. |
