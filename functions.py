import psutil, platform, subprocess, socket , time , datetime , configparser
from  pathlib import Path

#------------------------------------------------------------------------
#System info:

def get_hostname():
	return socket.gethostname()

def get_battery_info():
	battery = psutil.sensors_battery()
	percent = battery.percent if battery else None
	power_plugged = battery.power_plugged if battery else None
	return {
		'percent': percent,
		'power_plugged': power_plugged,
	}

def get_uptime():
  uptime = psutil.boot_time()
  delta = datetime.datetime.now() - datetime.datetime.fromtimestamp(uptime)
  return f"{delta.days} days, {delta.seconds//3600} hours, {delta.seconds//60 % 60} minutes"


def get_memory_usage():
  memory = psutil.virtual_memory()
  return f"Free: {memory.free / (1024 * 1024)} MB, Used: {memory.used / (1024 * 1024)} MB"

def get_disk_usage(path="/"):
  disk = psutil.disk_usage(path)
  #return f"Free: {disk.free / (1024 * 1024 * 1024)} GB, Used: {disk.used / (1024 * 1024 * 1024)} GB"
  return disk.percent

def get_network_traffic():
  net = psutil.net_io_counters()
  return f"Received: {net.bytes_recv} bytes, Transmitted: {net.bytes_sent} bytes"

def get_system_info():
	info = {
		'system': platform.system(),
		'release': platform.release(),
		'cpu_usage': psutil.cpu_percent(),
		'memory_usage_p': psutil.virtual_memory().percent,
		'memory_usage': get_memory_usage(),
		'disk_usage': get_disk_usage(),
		'network_traffic': get_network_traffic(),
		'battery': get_battery_info(),
		'host': get_hostname(),
		'uptime': get_uptime(),
	}
	return info

#---------------------------------------------------------------------
#Command execution:

def run_command(command):
    result = subprocess.run(command, shell=True, text=True, capture_output=True)
    
    if result.returncode == 0:
        print("Standard Output:")
        print(result.stdout)
        return result.stdout
    else:
        print("Standard Error:")
        print(result.stderr)
        return result.stderr

#---------------------------------------------------------------------
#Settings save:

SETTING_LOCATION = Path('./config.ini').absolute()

class Settings(object):
    def __init__(self,setting_name) -> None:
        self.setting_name = setting_name

    def save(self,key,value):
        try:
            config = configparser.ConfigParser()
            config.read(SETTING_LOCATION)

            if not config.has_section(self.setting_name):
                config.add_section(self.setting_name)

            config.set(self.setting_name, key, value)

            with open(SETTING_LOCATION, "w") as config_file:
                config.write(config_file)
        except Exception as e:
            print('Error: {}'.format(e))

    def load(self,key):
        try:
            config = configparser.ConfigParser()
            config.read(SETTING_LOCATION)

            if config.has_option(self.setting_name, key):
                value = config.get(self.setting_name, key)
                return value
            else:  
                print('No key named: {} found'.format(key))
        except Exception as e:
            print('Error: {}'.format(e))

    def delete(self,key):
        try:
            config = configparser.ConfigParser()
            config.read(SETTING_LOCATION)

            if not config.has_section(self.setting_name):
                return
            else:
                if config.has_option(self.setting_name, key):
                    config.remove_option(self.setting_name, key)
                    config.remove_section(self.setting_name)
                    with open(SETTING_LOCATION, 'w') as config_file:
                        config.write(config_file)
        except Exception as e:
            print('Error: {}'.format(e))
#Wifi ------------------------------------------------
def  get_wifis():   
    r = subprocess.check_output('sudo wifi -s wlan1', shell=True)
    return r