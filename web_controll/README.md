# HackBerry-Pi: A Raspberry Pi Zero 2 W Cybersecurity Toolkit

Inspired by the legendary WiFi Pineapple and the versatile USB Rubber Ducky, HackBerry-Pi empowers you to delve into the world of penetration testing for Windows PCs and Wi-Fi infrastructure. Built on the compact and powerful Raspberry Pi Zero 2 W, this project provides a portable and user-friendly platform to enhance your security expertise.

## Requirements:

- Raspberry Pi Zero 2 W
- External USB Wi-Fi antenna (compatible with Raspberry Pi Zero 2 W and supporting monitor mode im using a brostrend)
- Micro-B male to 2x USB-A female splitter cable
- SD card (minimum 8GB)
- Standard USB-A male to USB-A male cable

## Getting Started (Simple Steps):

### 1. Download the HackBerry-Pi Image:

Head over to the project's releases section to grab the latest image file specifically designed for HackBerry-Pi.

### 2. Flash the Image:

Utilize a user-friendly tool like Raspberry Pi Imager or Balena Etcher to effortlessly flash the downloaded image onto your SD card. This process prepares the SD card to boot your Raspberry Pi with the HackBerry-Pi software pre-installed.

### 3. Power Up Your HackBerry-Pi:

Insert the flashed SD card into your Raspberry Pi Zero 2 W, connect the necessary peripherals (external Wi-Fi antenna, splitter cable, and power supply), and boot it up.

### 4. Connect to the Raspberry Pi's Wi-Fi:

By default, the Raspberry Pi will create its own Wi-Fi network `HB_Pi` upon booting. To connect your device to this network, use the pre-configured password: `HB_Pi_1234` (remember to change this password for enhanced security after the initial setup).

### 5. Configure Your HackBerry-Pi:

You have the flexibility to configure your HackBerry-Pi using two convenient methods:

- **Secure Shell (SSH):** Establish a secure remote connection from another computer on your network using SSH credentials provided in the project documentation.
- **Web Interface:** Open a web browser on your connected device and navigate to [http://raspberrypi](http://raspberrypi) to access the web-based configuration interface.

## Additional Notes:

- For detailed instructions, comprehensive configuration options, and security best practices, kindly refer to the project's comprehensive documentation ([Link to Documentation Here]).
- Remember to customize the default password (`secrets_file`) after the initial setup to safeguard your HackBerry-Pi.
- Embrace the world of ethical hacking with HackBerry-Pi!
