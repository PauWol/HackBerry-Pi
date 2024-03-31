import subprocess , os

SCRIPTNAME = 'wifi.py'
SCRIPTPATH = os.path.abspath('./'+SCRIPTNAME)
REQUIREMENTSNAME = os.path.abspath('./'+'requirements.txt')
SYSTEMCOMMAND = os.path.abspath('./'+'systemcommand.txt')

def read_line(file,function,*args):
    try:    
        with open(file, 'r') as file:
        # Iterate over each line in the file
            for line in file:
                # Process each line as needed
                if args:
                    print('[+] Running ',line.strip(),args,'...')
                    function(line.strip() + args[0])
                else:
                    print('[+] Running ',line.strip(),'...')
                    function(line.strip())
    except Exception as e:
        print('[-] ',e)

def run_line(command):
    try:
        subprocess.call(command, shell=True)
    except Exception as e:
        print('[-] ',e)


def main():
    #Install requirements:
    print("[+] Installing required packages...")
    read_line(REQUIREMENTSNAME,run_line)

    #Make script system command:
    print("[+] Making the script a system command...")
    print("[+] This will allow you to call the script from any terminal with just '" + os.path.splitext(SCRIPTNAME)[0] + "'.")
    run_line('sudo chmod +x ' + SCRIPTPATH)
    run_line('sudo ln -s ' + SCRIPTPATH + ' /usr/local/bin/wifi')
    
if  __name__ == "__main__":
    main()