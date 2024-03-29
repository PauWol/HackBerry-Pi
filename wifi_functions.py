import sys
import wifi
import wifiap

def connect_to_wifi(ssid, password):
    # Enable WiFi
    wifi.enable()
    
    # Connect to the existing WiFi network
    wifi.connect(ssid, password)
    
    # Check if connection is successful
    if wifi.is_connected():
        print(f"Connected to WiFi network: {ssid}")
    else:
        print("Failed to connect to WiFi network")

def create_wifi_ap(ssid, password):
    # Set up the WiFi access point
    wifiap.configure(ssid, password)
    print(f"WiFi access point created with SSID: {ssid}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python script.py -cw <AP_SSID> <AP_Password> OR python script.py -cap <Existing_SSID> <Existing_Password>")
        sys.exit(1)

    option = sys.argv[1]
    ssid = sys.argv[2]
    password = sys.argv[3]
    
    if option == "-cw":
        create_wifi_ap(ssid, password)
    elif option == "-cap":
        connect_to_wifi(ssid, password)
    else:
        print("Invalid option. Usage: -cw (create WiFi AP), -cap (connect to existing WiFi)")
