EESchema Schematic File Version 4
EELAYER 30 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 1 1
Title ""
Date ""
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L Analog_Switch:CD4051B U2
U 1 1 5E667F4C
P 6800 1500
F 0 "U2" H 6800 2381 50  0000 C CNN
F 1 "CD4051B" H 6800 2290 50  0000 C CNN
F 2 "Package_DIP:DIP-16_W7.62mm" H 6950 750 50  0001 L CNN
F 3 "http://www.ti.com/lit/ds/symlink/cd4052b.pdf" H 6780 1600 50  0001 C CNN
	1    6800 1500
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR01
U 1 1 5E66DC82
P 1000 1250
F 0 "#PWR01" H 1000 1000 50  0001 C CNN
F 1 "GND" H 1005 1077 50  0000 C CNN
F 2 "" H 1000 1250 50  0001 C CNN
F 3 "" H 1000 1250 50  0001 C CNN
	1    1000 1250
	1    0    0    -1  
$EndComp
Wire Wire Line
	1000 1250 1000 1150
Wire Wire Line
	1000 1150 1300 1150
$Comp
L power:GND #PWR02
U 1 1 5E670765
P 6150 2000
F 0 "#PWR02" H 6150 1750 50  0001 C CNN
F 1 "GND" H 6155 1827 50  0000 C CNN
F 2 "" H 6150 2000 50  0001 C CNN
F 3 "" H 6150 2000 50  0001 C CNN
	1    6150 2000
	1    0    0    -1  
$EndComp
Wire Wire Line
	6150 2000 6150 1950
Wire Wire Line
	6150 1500 6300 1500
Wire Wire Line
	6150 1950 6350 1950
Wire Wire Line
	6350 1950 6350 2200
Wire Wire Line
	6350 2200 6700 2200
Connection ~ 6150 1950
Wire Wire Line
	6150 1950 6150 1500
Wire Wire Line
	6800 2200 6700 2200
Connection ~ 6700 2200
$Comp
L Connector:Conn_01x08_Male J1
U 1 1 5E67E69D
P 7500 1700
F 0 "J1" H 7472 1582 50  0000 R CNN
F 1 "Conn_01x08_Male" H 7472 1673 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical" H 7500 1700 50  0001 C CNN
F 3 "~" H 7500 1700 50  0001 C CNN
	1    7500 1700
	-1   0    0    1   
$EndComp
$Comp
L power:VCC #PWR09
U 1 1 5E67FC94
P 7150 800
F 0 "#PWR09" H 7150 650 50  0001 C CNN
F 1 "VCC" H 7167 973 50  0000 C CNN
F 2 "" H 7150 800 50  0001 C CNN
F 3 "" H 7150 800 50  0001 C CNN
	1    7150 800 
	1    0    0    -1  
$EndComp
Wire Wire Line
	7150 800  6900 800 
Text GLabel 6300 1000 0    50   Input ~ 0
bit1
Text GLabel 6300 1100 0    50   Input ~ 0
bit2
Text GLabel 6300 1200 0    50   Input ~ 0
bit3
Text GLabel 6300 1400 0    50   Input ~ 0
CD4051-0
$Comp
L Analog_Switch:CD4051B U7
U 1 1 5E6878E8
P 8900 1500
F 0 "U7" H 8900 2381 50  0000 C CNN
F 1 "CD4051B" H 8900 2290 50  0000 C CNN
F 2 "Package_DIP:DIP-16_W7.62mm" H 9050 750 50  0001 L CNN
F 3 "http://www.ti.com/lit/ds/symlink/cd4052b.pdf" H 8880 1600 50  0001 C CNN
	1    8900 1500
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR012
U 1 1 5E6878EE
P 8250 2000
F 0 "#PWR012" H 8250 1750 50  0001 C CNN
F 1 "GND" H 8255 1827 50  0000 C CNN
F 2 "" H 8250 2000 50  0001 C CNN
F 3 "" H 8250 2000 50  0001 C CNN
	1    8250 2000
	1    0    0    -1  
$EndComp
Wire Wire Line
	8250 2000 8250 1950
Wire Wire Line
	8250 1500 8400 1500
Wire Wire Line
	8250 1950 8450 1950
Wire Wire Line
	8450 1950 8450 2200
Wire Wire Line
	8450 2200 8800 2200
Connection ~ 8250 1950
Wire Wire Line
	8250 1950 8250 1500
Wire Wire Line
	8900 2200 8800 2200
Connection ~ 8800 2200
$Comp
L Connector:Conn_01x08_Male J6
U 1 1 5E6878FD
P 9600 1700
F 0 "J6" H 9572 1582 50  0000 R CNN
F 1 "Conn_01x08_Male" H 9572 1673 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical" H 9600 1700 50  0001 C CNN
F 3 "~" H 9600 1700 50  0001 C CNN
	1    9600 1700
	-1   0    0    1   
$EndComp
$Comp
L power:VCC #PWR015
U 1 1 5E687903
P 9250 800
F 0 "#PWR015" H 9250 650 50  0001 C CNN
F 1 "VCC" H 9267 973 50  0000 C CNN
F 2 "" H 9250 800 50  0001 C CNN
F 3 "" H 9250 800 50  0001 C CNN
	1    9250 800 
	1    0    0    -1  
$EndComp
Wire Wire Line
	9250 800  9000 800 
Text GLabel 8400 1000 0    50   Input ~ 0
bit1
Text GLabel 8400 1100 0    50   Input ~ 0
bit2
Text GLabel 8400 1200 0    50   Input ~ 0
bit3
Text GLabel 8400 1400 0    50   Input ~ 0
CD4051-5
$Comp
L Analog_Switch:CD4051B U5
U 1 1 5E689EF8
P 6800 3150
F 0 "U5" H 6800 4031 50  0000 C CNN
F 1 "CD4051B" H 6800 3940 50  0000 C CNN
F 2 "Package_DIP:DIP-16_W7.62mm" H 6950 2400 50  0001 L CNN
F 3 "http://www.ti.com/lit/ds/symlink/cd4052b.pdf" H 6780 3250 50  0001 C CNN
	1    6800 3150
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR07
U 1 1 5E689EFE
P 6150 3650
F 0 "#PWR07" H 6150 3400 50  0001 C CNN
F 1 "GND" H 6155 3477 50  0000 C CNN
F 2 "" H 6150 3650 50  0001 C CNN
F 3 "" H 6150 3650 50  0001 C CNN
	1    6150 3650
	1    0    0    -1  
$EndComp
Wire Wire Line
	6150 3650 6150 3600
Wire Wire Line
	6150 3150 6300 3150
Wire Wire Line
	6150 3600 6350 3600
Wire Wire Line
	6350 3600 6350 3850
Wire Wire Line
	6350 3850 6700 3850
Connection ~ 6150 3600
Wire Wire Line
	6150 3600 6150 3150
Wire Wire Line
	6800 3850 6700 3850
Connection ~ 6700 3850
$Comp
L Connector:Conn_01x08_Male J4
U 1 1 5E689F0D
P 7500 3350
F 0 "J4" H 7472 3232 50  0000 R CNN
F 1 "Conn_01x08_Male" H 7472 3323 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical" H 7500 3350 50  0001 C CNN
F 3 "~" H 7500 3350 50  0001 C CNN
	1    7500 3350
	-1   0    0    1   
$EndComp
$Comp
L power:VCC #PWR010
U 1 1 5E689F13
P 7150 2450
F 0 "#PWR010" H 7150 2300 50  0001 C CNN
F 1 "VCC" H 7167 2623 50  0000 C CNN
F 2 "" H 7150 2450 50  0001 C CNN
F 3 "" H 7150 2450 50  0001 C CNN
	1    7150 2450
	1    0    0    -1  
$EndComp
Wire Wire Line
	7150 2450 6900 2450
Text GLabel 6300 2650 0    50   Input ~ 0
bit1
Text GLabel 6300 2750 0    50   Input ~ 0
bit2
Text GLabel 6300 2850 0    50   Input ~ 0
bit3
Text GLabel 6300 3050 0    50   Input ~ 0
CD4051-3
$Comp
L Analog_Switch:CD4051B U8
U 1 1 5E68B1E2
P 8900 3150
F 0 "U8" H 8900 4031 50  0000 C CNN
F 1 "CD4051B" H 8900 3940 50  0000 C CNN
F 2 "Package_DIP:DIP-16_W7.62mm" H 9050 2400 50  0001 L CNN
F 3 "http://www.ti.com/lit/ds/symlink/cd4052b.pdf" H 8880 3250 50  0001 C CNN
	1    8900 3150
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR013
U 1 1 5E68B1E8
P 8250 3650
F 0 "#PWR013" H 8250 3400 50  0001 C CNN
F 1 "GND" H 8255 3477 50  0000 C CNN
F 2 "" H 8250 3650 50  0001 C CNN
F 3 "" H 8250 3650 50  0001 C CNN
	1    8250 3650
	1    0    0    -1  
$EndComp
Wire Wire Line
	8250 3650 8250 3600
Wire Wire Line
	8250 3150 8400 3150
Wire Wire Line
	8250 3600 8450 3600
Wire Wire Line
	8450 3600 8450 3850
Wire Wire Line
	8450 3850 8800 3850
Connection ~ 8250 3600
Wire Wire Line
	8250 3600 8250 3150
Wire Wire Line
	8900 3850 8800 3850
Connection ~ 8800 3850
$Comp
L Connector:Conn_01x08_Male J7
U 1 1 5E68B1F7
P 9600 3350
F 0 "J7" H 9572 3232 50  0000 R CNN
F 1 "Conn_01x08_Male" H 9572 3323 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical" H 9600 3350 50  0001 C CNN
F 3 "~" H 9600 3350 50  0001 C CNN
	1    9600 3350
	-1   0    0    1   
$EndComp
$Comp
L power:VCC #PWR016
U 1 1 5E68B1FD
P 9250 2450
F 0 "#PWR016" H 9250 2300 50  0001 C CNN
F 1 "VCC" H 9267 2623 50  0000 C CNN
F 2 "" H 9250 2450 50  0001 C CNN
F 3 "" H 9250 2450 50  0001 C CNN
	1    9250 2450
	1    0    0    -1  
$EndComp
Wire Wire Line
	9250 2450 9000 2450
Text GLabel 8400 2650 0    50   Input ~ 0
bit1
Text GLabel 8400 2750 0    50   Input ~ 0
bit2
Text GLabel 8400 2850 0    50   Input ~ 0
bit3
Text GLabel 8400 3050 0    50   Input ~ 0
CD4051-6
$Comp
L Analog_Switch:CD4051B U6
U 1 1 5E68D06E
P 6800 4800
F 0 "U6" H 6800 5681 50  0000 C CNN
F 1 "CD4051B" H 6800 5590 50  0000 C CNN
F 2 "Package_DIP:DIP-16_W7.62mm" H 6950 4050 50  0001 L CNN
F 3 "http://www.ti.com/lit/ds/symlink/cd4052b.pdf" H 6780 4900 50  0001 C CNN
	1    6800 4800
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR08
U 1 1 5E68D074
P 6150 5300
F 0 "#PWR08" H 6150 5050 50  0001 C CNN
F 1 "GND" H 6155 5127 50  0000 C CNN
F 2 "" H 6150 5300 50  0001 C CNN
F 3 "" H 6150 5300 50  0001 C CNN
	1    6150 5300
	1    0    0    -1  
$EndComp
Wire Wire Line
	6150 5300 6150 5250
Wire Wire Line
	6150 4800 6300 4800
Wire Wire Line
	6150 5250 6350 5250
Wire Wire Line
	6350 5250 6350 5500
Wire Wire Line
	6350 5500 6700 5500
Connection ~ 6150 5250
Wire Wire Line
	6150 5250 6150 4800
Wire Wire Line
	6800 5500 6700 5500
Connection ~ 6700 5500
$Comp
L Connector:Conn_01x08_Male J5
U 1 1 5E68D083
P 7500 5000
F 0 "J5" H 7472 4882 50  0000 R CNN
F 1 "Conn_01x08_Male" H 7472 4973 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical" H 7500 5000 50  0001 C CNN
F 3 "~" H 7500 5000 50  0001 C CNN
	1    7500 5000
	-1   0    0    1   
$EndComp
$Comp
L power:VCC #PWR011
U 1 1 5E68D089
P 7150 4100
F 0 "#PWR011" H 7150 3950 50  0001 C CNN
F 1 "VCC" H 7167 4273 50  0000 C CNN
F 2 "" H 7150 4100 50  0001 C CNN
F 3 "" H 7150 4100 50  0001 C CNN
	1    7150 4100
	1    0    0    -1  
$EndComp
Wire Wire Line
	7150 4100 6900 4100
Text GLabel 6300 4300 0    50   Input ~ 0
bit1
Text GLabel 6300 4400 0    50   Input ~ 0
bit2
Text GLabel 6300 4500 0    50   Input ~ 0
bit3
Text GLabel 6300 4700 0    50   Input ~ 0
CD4051-4
$Comp
L Analog_Switch:CD4051B U9
U 1 1 5E68F7E0
P 8900 4800
F 0 "U9" H 8900 5681 50  0000 C CNN
F 1 "CD4051B" H 8900 5590 50  0000 C CNN
F 2 "Package_DIP:DIP-16_W7.62mm" H 9050 4050 50  0001 L CNN
F 3 "http://www.ti.com/lit/ds/symlink/cd4052b.pdf" H 8880 4900 50  0001 C CNN
	1    8900 4800
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR014
U 1 1 5E68F7E6
P 8250 5300
F 0 "#PWR014" H 8250 5050 50  0001 C CNN
F 1 "GND" H 8255 5127 50  0000 C CNN
F 2 "" H 8250 5300 50  0001 C CNN
F 3 "" H 8250 5300 50  0001 C CNN
	1    8250 5300
	1    0    0    -1  
$EndComp
Wire Wire Line
	8250 5300 8250 5250
Wire Wire Line
	8250 4800 8400 4800
Wire Wire Line
	8250 5250 8450 5250
Wire Wire Line
	8450 5250 8450 5500
Wire Wire Line
	8450 5500 8800 5500
Connection ~ 8250 5250
Wire Wire Line
	8250 5250 8250 4800
Wire Wire Line
	8900 5500 8800 5500
Connection ~ 8800 5500
$Comp
L Connector:Conn_01x08_Male J8
U 1 1 5E68F7F5
P 9600 5000
F 0 "J8" H 9572 4882 50  0000 R CNN
F 1 "Conn_01x08_Male" H 9572 4973 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical" H 9600 5000 50  0001 C CNN
F 3 "~" H 9600 5000 50  0001 C CNN
	1    9600 5000
	-1   0    0    1   
$EndComp
$Comp
L power:VCC #PWR017
U 1 1 5E68F7FB
P 9250 4100
F 0 "#PWR017" H 9250 3950 50  0001 C CNN
F 1 "VCC" H 9267 4273 50  0000 C CNN
F 2 "" H 9250 4100 50  0001 C CNN
F 3 "" H 9250 4100 50  0001 C CNN
	1    9250 4100
	1    0    0    -1  
$EndComp
Wire Wire Line
	9250 4100 9000 4100
Text GLabel 8400 4300 0    50   Input ~ 0
bit1
Text GLabel 8400 4400 0    50   Input ~ 0
bit2
Text GLabel 8400 4500 0    50   Input ~ 0
bit3
Text GLabel 8400 4700 0    50   Input ~ 0
CD4051-7
$Comp
L Analog_Switch:CD4051B U3
U 1 1 5E691848
P 1850 6550
F 0 "U3" H 1850 7431 50  0000 C CNN
F 1 "CD4051B" H 1850 7340 50  0000 C CNN
F 2 "Package_DIP:DIP-16_W7.62mm" H 2000 5800 50  0001 L CNN
F 3 "http://www.ti.com/lit/ds/symlink/cd4052b.pdf" H 1830 6650 50  0001 C CNN
	1    1850 6550
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR03
U 1 1 5E69184E
P 1200 7050
F 0 "#PWR03" H 1200 6800 50  0001 C CNN
F 1 "GND" H 1205 6877 50  0000 C CNN
F 2 "" H 1200 7050 50  0001 C CNN
F 3 "" H 1200 7050 50  0001 C CNN
	1    1200 7050
	1    0    0    -1  
$EndComp
Wire Wire Line
	1200 7050 1200 7000
Wire Wire Line
	1200 6550 1350 6550
Wire Wire Line
	1200 7000 1400 7000
Wire Wire Line
	1400 7000 1400 7250
Wire Wire Line
	1400 7250 1750 7250
Connection ~ 1200 7000
Wire Wire Line
	1200 7000 1200 6550
Wire Wire Line
	1850 7250 1750 7250
Connection ~ 1750 7250
$Comp
L Connector:Conn_01x08_Male J2
U 1 1 5E69185D
P 2550 6750
F 0 "J2" H 2522 6632 50  0000 R CNN
F 1 "Conn_01x08_Male" H 2522 6723 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical" H 2550 6750 50  0001 C CNN
F 3 "~" H 2550 6750 50  0001 C CNN
	1    2550 6750
	-1   0    0    1   
$EndComp
Wire Wire Line
	2200 5850 1950 5850
Text GLabel 1350 6050 0    50   Input ~ 0
bit1
Text GLabel 1350 6150 0    50   Input ~ 0
bit2
Text GLabel 1350 6250 0    50   Input ~ 0
bit3
Text GLabel 1350 6450 0    50   Input ~ 0
CD4051-1
$Comp
L Analog_Switch:CD4051B U4
U 1 1 5E6941F4
P 3950 6550
F 0 "U4" H 3950 7431 50  0000 C CNN
F 1 "CD4051B" H 3950 7340 50  0000 C CNN
F 2 "Package_DIP:DIP-16_W7.62mm" H 4100 5800 50  0001 L CNN
F 3 "http://www.ti.com/lit/ds/symlink/cd4052b.pdf" H 3930 6650 50  0001 C CNN
	1    3950 6550
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR05
U 1 1 5E6941FA
P 3300 7050
F 0 "#PWR05" H 3300 6800 50  0001 C CNN
F 1 "GND" H 3305 6877 50  0000 C CNN
F 2 "" H 3300 7050 50  0001 C CNN
F 3 "" H 3300 7050 50  0001 C CNN
	1    3300 7050
	1    0    0    -1  
$EndComp
Wire Wire Line
	3300 7050 3300 7000
Wire Wire Line
	3300 6550 3450 6550
Wire Wire Line
	3300 7000 3500 7000
Wire Wire Line
	3500 7000 3500 7250
Wire Wire Line
	3500 7250 3850 7250
Connection ~ 3300 7000
Wire Wire Line
	3300 7000 3300 6550
Wire Wire Line
	3950 7250 3850 7250
Connection ~ 3850 7250
$Comp
L Connector:Conn_01x08_Male J3
U 1 1 5E694209
P 4650 6750
F 0 "J3" H 4622 6632 50  0000 R CNN
F 1 "Conn_01x08_Male" H 4622 6723 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical" H 4650 6750 50  0001 C CNN
F 3 "~" H 4650 6750 50  0001 C CNN
	1    4650 6750
	-1   0    0    1   
$EndComp
$Comp
L power:VCC #PWR06
U 1 1 5E69420F
P 4300 5850
F 0 "#PWR06" H 4300 5700 50  0001 C CNN
F 1 "VCC" H 4317 6023 50  0000 C CNN
F 2 "" H 4300 5850 50  0001 C CNN
F 3 "" H 4300 5850 50  0001 C CNN
	1    4300 5850
	1    0    0    -1  
$EndComp
Wire Wire Line
	4300 5850 4050 5850
Text GLabel 3450 6050 0    50   Input ~ 0
bit1
Text GLabel 3450 6150 0    50   Input ~ 0
bit2
Text GLabel 3450 6250 0    50   Input ~ 0
bit3
Text GLabel 3450 6450 0    50   Input ~ 0
CD4051-2
Text GLabel 1700 3150 0    50   Input ~ 0
CD4051-0
Text GLabel 1700 3250 0    50   Input ~ 0
CD4051-1
Text GLabel 1700 3350 0    50   Input ~ 0
CD4051-2
Text GLabel 1700 3450 0    50   Input ~ 0
CD4051-3
Text GLabel 1700 3550 0    50   Input ~ 0
CD4051-4
Text GLabel 1700 3650 0    50   Input ~ 0
CD4051-5
Text GLabel 1700 3750 0    50   Input ~ 0
CD4051-6
Text GLabel 1700 3850 0    50   Input ~ 0
CD4051-7
Wire Wire Line
	1700 2750 1300 2750
Wire Wire Line
	1300 2750 1300 1150
Connection ~ 1300 1150
Wire Wire Line
	1300 1150 1700 1150
$Comp
L power:GND #PWR020
U 1 1 5E6ADF67
P 4250 2650
F 0 "#PWR020" H 4250 2400 50  0001 C CNN
F 1 "GND" H 4255 2477 50  0000 C CNN
F 2 "" H 4250 2650 50  0001 C CNN
F 3 "" H 4250 2650 50  0001 C CNN
	1    4250 2650
	1    0    0    -1  
$EndComp
Wire Wire Line
	3700 3550 4100 3550
Wire Wire Line
	4100 3550 4100 2650
Wire Wire Line
	4100 2650 4250 2650
Text GLabel 1700 1250 0    50   Input ~ 0
bit1
Text GLabel 1700 1350 0    50   Input ~ 0
bit2
Text GLabel 1700 1450 0    50   Input ~ 0
bit3
$Comp
L Driver_Motor:Pololu_Breakout_A4988 A1
U 1 1 5E6B5BE9
P 3100 4900
F 0 "A1" H 3150 5781 50  0000 C CNN
F 1 "Pololu_Breakout_A4988" H 3150 5690 50  0000 C CNN
F 2 "Module:Pololu_Breakout-16_15.2x20.3mm" H 3375 4150 50  0001 L CNN
F 3 "https://www.pololu.com/product/2980/pictures" H 3200 4600 50  0001 C CNN
	1    3100 4900
	1    0    0    -1  
$EndComp
Wire Wire Line
	3100 5700 3300 5700
$Comp
L power:GND #PWR019
U 1 1 5E6BE250
P 3100 5700
F 0 "#PWR019" H 3100 5450 50  0001 C CNN
F 1 "GND" H 3105 5527 50  0000 C CNN
F 2 "" H 3100 5700 50  0001 C CNN
F 3 "" H 3100 5700 50  0001 C CNN
	1    3100 5700
	1    0    0    -1  
$EndComp
Connection ~ 3100 5700
$Comp
L power:VCC #PWR018
U 1 1 5E6BEA41
P 2600 4200
F 0 "#PWR018" H 2600 4050 50  0001 C CNN
F 1 "VCC" H 2617 4373 50  0000 C CNN
F 2 "" H 2600 4200 50  0001 C CNN
F 3 "" H 2600 4200 50  0001 C CNN
	1    2600 4200
	1    0    0    -1  
$EndComp
Wire Wire Line
	2600 4200 3100 4200
$Comp
L Connector:Conn_01x04_Male J9
U 1 1 5E6C1726
P 3800 5000
F 0 "J9" H 3772 4882 50  0000 R CNN
F 1 "Conn_01x04_Male" H 3772 4973 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical" H 3800 5000 50  0001 C CNN
F 3 "~" H 3800 5000 50  0001 C CNN
	1    3800 5000
	-1   0    0    1   
$EndComp
Text GLabel 3300 4200 2    50   Input ~ 0
VMOT
$Comp
L Connector:Conn_01x02_Male J10
U 1 1 5E6C2CD1
P 950 4600
F 0 "J10" H 1058 4781 50  0000 C CNN
F 1 "Conn_01x02_Male" H 1058 4690 50  0000 C CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical" H 950 4600 50  0001 C CNN
F 3 "~" H 950 4600 50  0001 C CNN
	1    950  4600
	1    0    0    -1  
$EndComp
Text GLabel 1150 4600 2    50   Input ~ 0
VMOT
$Comp
L power:GND #PWR021
U 1 1 5E6C40BB
P 1150 4700
F 0 "#PWR021" H 1150 4450 50  0001 C CNN
F 1 "GND" H 1155 4527 50  0000 C CNN
F 2 "" H 1150 4700 50  0001 C CNN
F 3 "" H 1150 4700 50  0001 C CNN
	1    1150 4700
	1    0    0    -1  
$EndComp
$Comp
L Device:R R3
U 1 1 5E6C74F2
P 2700 5550
F 0 "R3" H 2770 5596 50  0000 L CNN
F 1 "R" H 2770 5505 50  0000 L CNN
F 2 "Resistor_THT:R_Axial_DIN0411_L9.9mm_D3.6mm_P12.70mm_Horizontal" V 2630 5550 50  0001 C CNN
F 3 "~" H 2700 5550 50  0001 C CNN
	1    2700 5550
	1    0    0    -1  
$EndComp
$Comp
L Device:R R2
U 1 1 5E6C9C3C
P 2600 5450
F 0 "R2" H 2670 5496 50  0000 L CNN
F 1 "R" H 2670 5405 50  0000 L CNN
F 2 "Resistor_THT:R_Axial_DIN0411_L9.9mm_D3.6mm_P12.70mm_Horizontal" V 2530 5450 50  0001 C CNN
F 3 "~" H 2600 5450 50  0001 C CNN
	1    2600 5450
	1    0    0    -1  
$EndComp
$Comp
L Device:R R1
U 1 1 5E6CA360
P 2500 5350
F 0 "R1" H 2570 5396 50  0000 L CNN
F 1 "R" H 2570 5305 50  0000 L CNN
F 2 "Resistor_THT:R_Axial_DIN0411_L9.9mm_D3.6mm_P12.70mm_Horizontal" V 2430 5350 50  0001 C CNN
F 3 "~" H 2500 5350 50  0001 C CNN
	1    2500 5350
	1    0    0    -1  
$EndComp
Wire Wire Line
	2500 5200 2700 5200
Wire Wire Line
	2600 5300 2700 5300
Wire Wire Line
	2400 5200 2500 5200
Connection ~ 2500 5200
Wire Wire Line
	2400 5300 2600 5300
Connection ~ 2600 5300
Wire Wire Line
	2400 5400 2700 5400
Connection ~ 2700 5400
Wire Wire Line
	2600 5600 2600 5700
Wire Wire Line
	2600 5700 2700 5700
Connection ~ 2700 5700
Wire Wire Line
	2700 5700 3100 5700
Wire Wire Line
	2500 5500 2500 5700
Wire Wire Line
	2500 5700 2600 5700
Connection ~ 2600 5700
Wire Wire Line
	1900 4200 2600 4200
Connection ~ 2600 4200
Text GLabel 2700 4800 0    50   Input ~ 0
s1_EN
Text GLabel 2700 4900 0    50   Input ~ 0
s1_STEP
Text GLabel 2700 5000 0    50   Input ~ 0
s1_DIR
$Comp
L Driver_Motor:Pololu_Breakout_A4988 A2
U 1 1 5E6FC3CC
P 5450 4000
F 0 "A2" H 5500 4881 50  0000 C CNN
F 1 "Pololu_Breakout_A4988" H 5500 4790 50  0000 C CNN
F 2 "Module:Pololu_Breakout-16_15.2x20.3mm" H 5725 3250 50  0001 L CNN
F 3 "https://www.pololu.com/product/2980/pictures" H 5550 3700 50  0001 C CNN
	1    5450 4000
	1    0    0    -1  
$EndComp
$Comp
L power:VCC #PWR022
U 1 1 5E6FC3D2
P 4950 3300
F 0 "#PWR022" H 4950 3150 50  0001 C CNN
F 1 "VCC" H 4967 3473 50  0000 C CNN
F 2 "" H 4950 3300 50  0001 C CNN
F 3 "" H 4950 3300 50  0001 C CNN
	1    4950 3300
	1    0    0    -1  
$EndComp
Wire Wire Line
	4950 3300 5450 3300
$Comp
L Connector:Conn_01x04_Male J13
U 1 1 5E6FC3D9
P 6150 4100
F 0 "J13" H 6122 3982 50  0000 R CNN
F 1 "Conn_01x04_Male" H 6122 4073 50  0000 R CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical" H 6150 4100 50  0001 C CNN
F 3 "~" H 6150 4100 50  0001 C CNN
	1    6150 4100
	-1   0    0    1   
$EndComp
Text GLabel 5650 3300 2    50   Input ~ 0
VMOT
$Comp
L Device:R R6
U 1 1 5E6FC3E0
P 5050 4650
F 0 "R6" H 5120 4696 50  0000 L CNN
F 1 "R" H 5120 4605 50  0000 L CNN
F 2 "Resistor_THT:R_Axial_DIN0411_L9.9mm_D3.6mm_P12.70mm_Horizontal" V 4980 4650 50  0001 C CNN
F 3 "~" H 5050 4650 50  0001 C CNN
	1    5050 4650
	1    0    0    -1  
$EndComp
$Comp
L Device:R R5
U 1 1 5E6FC3E6
P 4950 4550
F 0 "R5" H 5020 4596 50  0000 L CNN
F 1 "R" H 5020 4505 50  0000 L CNN
F 2 "Resistor_THT:R_Axial_DIN0411_L9.9mm_D3.6mm_P12.70mm_Horizontal" V 4880 4550 50  0001 C CNN
F 3 "~" H 4950 4550 50  0001 C CNN
	1    4950 4550
	1    0    0    -1  
$EndComp
$Comp
L Device:R R4
U 1 1 5E6FC3EC
P 4850 4450
F 0 "R4" H 4920 4496 50  0000 L CNN
F 1 "R" H 4920 4405 50  0000 L CNN
F 2 "Resistor_THT:R_Axial_DIN0411_L9.9mm_D3.6mm_P12.70mm_Horizontal" V 4780 4450 50  0001 C CNN
F 3 "~" H 4850 4450 50  0001 C CNN
	1    4850 4450
	1    0    0    -1  
$EndComp
Wire Wire Line
	4850 4300 5050 4300
Wire Wire Line
	4950 4400 5050 4400
Wire Wire Line
	4750 4300 4850 4300
Connection ~ 4850 4300
Wire Wire Line
	4750 4400 4950 4400
Connection ~ 4950 4400
Wire Wire Line
	4750 4500 5050 4500
Connection ~ 5050 4500
Wire Wire Line
	4850 4600 4850 4800
Wire Wire Line
	4250 3300 4950 3300
Connection ~ 4950 3300
Text GLabel 5050 3900 0    50   Input ~ 0
s2_EN
Text GLabel 5050 4000 0    50   Input ~ 0
s2_STEP
Text GLabel 5050 4100 0    50   Input ~ 0
s2_DIR
Wire Wire Line
	4850 4800 4950 4800
Connection ~ 5050 4800
Wire Wire Line
	5050 4800 5450 4800
Connection ~ 5450 4800
Wire Wire Line
	5450 4800 5650 4800
Wire Wire Line
	4950 4700 4950 4800
Connection ~ 4950 4800
Wire Wire Line
	4950 4800 5050 4800
$Comp
L power:GND #PWR023
U 1 1 5E709422
P 5450 4800
F 0 "#PWR023" H 5450 4550 50  0001 C CNN
F 1 "GND" H 5455 4627 50  0000 C CNN
F 2 "" H 5450 4800 50  0001 C CNN
F 3 "" H 5450 4800 50  0001 C CNN
	1    5450 4800
	1    0    0    -1  
$EndComp
Text GLabel 1700 1550 0    50   Input ~ 0
s1_EN
Text GLabel 1700 1650 0    50   Input ~ 0
s1_STEP
Text GLabel 1700 1750 0    50   Input ~ 0
s1_DIR
Text GLabel 1700 1850 0    50   Input ~ 0
s2_EN
Text GLabel 1700 1950 0    50   Input ~ 0
s2_STEP
Text GLabel 1700 2050 0    50   Input ~ 0
s2_DIR
$Comp
L Transistor_FET:IRF540N Q1
U 1 1 5E71B551
P 4750 1450
F 0 "Q1" H 4954 1496 50  0000 L CNN
F 1 "IRF540N" H 4954 1405 50  0000 L CNN
F 2 "Package_TO_SOT_THT:TO-220-3_Vertical" H 5000 1375 50  0001 L CIN
F 3 "http://www.irf.com/product-info/datasheets/data/irf540n.pdf" H 4750 1450 50  0001 L CNN
	1    4750 1450
	1    0    0    -1  
$EndComp
Text GLabel 4550 1450 0    50   Input ~ 0
EM_SIG
Text GLabel 1700 2150 0    50   Input ~ 0
EM_SIG
$Comp
L Device:R R7
U 1 1 5E7238A9
P 4550 1600
F 0 "R7" H 4620 1646 50  0000 L CNN
F 1 "R" H 4620 1555 50  0000 L CNN
F 2 "Resistor_THT:R_Axial_DIN0411_L9.9mm_D3.6mm_P12.70mm_Horizontal" V 4480 1600 50  0001 C CNN
F 3 "~" H 4550 1600 50  0001 C CNN
	1    4550 1600
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR024
U 1 1 5E72A57E
P 4550 1750
F 0 "#PWR024" H 4550 1500 50  0001 C CNN
F 1 "GND" H 4555 1577 50  0000 C CNN
F 2 "" H 4550 1750 50  0001 C CNN
F 3 "" H 4550 1750 50  0001 C CNN
	1    4550 1750
	1    0    0    -1  
$EndComp
$Comp
L power:GND #PWR026
U 1 1 5E72ACD3
P 4850 1650
F 0 "#PWR026" H 4850 1400 50  0001 C CNN
F 1 "GND" H 4855 1477 50  0000 C CNN
F 2 "" H 4850 1650 50  0001 C CNN
F 3 "" H 4850 1650 50  0001 C CNN
	1    4850 1650
	1    0    0    -1  
$EndComp
$Comp
L Connector:Conn_01x02_Male J15
U 1 1 5E72B494
P 4650 950
F 0 "J15" H 4758 1131 50  0000 C CNN
F 1 "Conn_01x02_Male" H 4758 1040 50  0000 C CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical" H 4650 950 50  0001 C CNN
F 3 "~" H 4650 950 50  0001 C CNN
	1    4650 950 
	1    0    0    -1  
$EndComp
Wire Wire Line
	4850 1050 4850 1250
Text GLabel 4850 950  2    50   Input ~ 0
VEM
$Comp
L Connector:Conn_01x02_Male J14
U 1 1 5E7347AB
P 4500 2300
F 0 "J14" H 4608 2481 50  0000 C CNN
F 1 "Conn_01x02_Male" H 4608 2390 50  0000 C CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical" H 4500 2300 50  0001 C CNN
F 3 "~" H 4500 2300 50  0001 C CNN
	1    4500 2300
	1    0    0    -1  
$EndComp
Text GLabel 4700 2300 2    50   Input ~ 0
VEM
$Comp
L power:GND #PWR025
U 1 1 5E735607
P 4700 2400
F 0 "#PWR025" H 4700 2150 50  0001 C CNN
F 1 "GND" H 4705 2227 50  0000 C CNN
F 2 "" H 4700 2400 50  0001 C CNN
F 3 "" H 4700 2400 50  0001 C CNN
	1    4700 2400
	1    0    0    -1  
$EndComp
$Comp
L Connector:Conn_01x02_Male J16
U 1 1 5E735E12
P 5250 2300
F 0 "J16" H 5358 2481 50  0000 C CNN
F 1 "Conn_01x02_Male" H 5358 2390 50  0000 C CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical" H 5250 2300 50  0001 C CNN
F 3 "~" H 5250 2300 50  0001 C CNN
	1    5250 2300
	1    0    0    -1  
$EndComp
Text GLabel 5450 2300 2    50   Input ~ 0
VMOT
Text GLabel 5450 2400 2    50   Input ~ 0
VEM
$Comp
L Device:D D1
U 1 1 5E7376F0
P 5250 1050
F 0 "D1" V 5204 1129 50  0000 L CNN
F 1 "D" V 5295 1129 50  0000 L CNN
F 2 "Diode_THT:D_5W_P12.70mm_Horizontal" H 5250 1050 50  0001 C CNN
F 3 "~" H 5250 1050 50  0001 C CNN
	1    5250 1050
	0    1    1    0   
$EndComp
Wire Wire Line
	4850 1250 5250 1250
Wire Wire Line
	5250 1250 5250 1200
Connection ~ 4850 1250
Wire Wire Line
	5250 900  4850 900 
Wire Wire Line
	4850 900  4850 950 
$Comp
L teensy:Teensy3.2 U1
U 1 1 5E66460A
P 2700 2500
F 0 "U1" H 2700 4137 60  0000 C CNN
F 1 "Teensy3.2" H 2700 4031 60  0000 C CNN
F 2 "autopatzer:Teensy30_31_32_LC" H 2700 1750 60  0001 C CNN
F 3 "" H 2700 1750 60  0000 C CNN
	1    2700 2500
	1    0    0    -1  
$EndComp
NoConn ~ 1700 2250
NoConn ~ 1700 2350
NoConn ~ 1700 2450
NoConn ~ 1700 2550
NoConn ~ 1700 2650
NoConn ~ 1700 2850
NoConn ~ 1700 2950
NoConn ~ 1700 3050
NoConn ~ 3700 3050
NoConn ~ 3700 3150
NoConn ~ 3700 3250
NoConn ~ 3700 3350
NoConn ~ 3700 3450
NoConn ~ 3700 3650
NoConn ~ 3700 3750
NoConn ~ 3700 3850
$Comp
L power:VCC #PWR0101
U 1 1 5E7F984A
P 2600 4500
F 0 "#PWR0101" H 2600 4350 50  0001 C CNN
F 1 "VCC" H 2617 4673 50  0000 C CNN
F 2 "" H 2600 4500 50  0001 C CNN
F 3 "" H 2600 4500 50  0001 C CNN
	1    2600 4500
	1    0    0    -1  
$EndComp
Wire Wire Line
	2600 4500 2700 4500
Wire Wire Line
	2700 4500 2700 4600
Connection ~ 2700 4500
$Comp
L power:VCC #PWR0102
U 1 1 5E8034E5
P 4950 3600
F 0 "#PWR0102" H 4950 3450 50  0001 C CNN
F 1 "VCC" H 4967 3773 50  0000 C CNN
F 2 "" H 4950 3600 50  0001 C CNN
F 3 "" H 4950 3600 50  0001 C CNN
	1    4950 3600
	1    0    0    -1  
$EndComp
Wire Wire Line
	4950 3600 5050 3600
Wire Wire Line
	5050 3600 5050 3700
Connection ~ 5050 3600
$Comp
L power:PWR_FLAG #FLG0101
U 1 1 5E829BB0
P 5450 2400
F 0 "#FLG0101" H 5450 2475 50  0001 C CNN
F 1 "PWR_FLAG" H 5450 2573 50  0000 C CNN
F 2 "" H 5450 2400 50  0001 C CNN
F 3 "~" H 5450 2400 50  0001 C CNN
	1    5450 2400
	-1   0    0    1   
$EndComp
$Comp
L power:PWR_FLAG #FLG0102
U 1 1 5E82A561
P 5450 2300
F 0 "#FLG0102" H 5450 2375 50  0001 C CNN
F 1 "PWR_FLAG" H 5450 2473 50  0000 C CNN
F 2 "" H 5450 2300 50  0001 C CNN
F 3 "~" H 5450 2300 50  0001 C CNN
	1    5450 2300
	1    0    0    -1  
$EndComp
$Comp
L power:VCC #PWR0103
U 1 1 5E82F873
P 2200 5850
F 0 "#PWR0103" H 2200 5700 50  0001 C CNN
F 1 "VCC" H 2217 6023 50  0000 C CNN
F 2 "" H 2200 5850 50  0001 C CNN
F 3 "" H 2200 5850 50  0001 C CNN
	1    2200 5850
	1    0    0    -1  
$EndComp
$Comp
L power:PWR_FLAG #FLG0103
U 1 1 5E832D79
P 6100 6000
F 0 "#FLG0103" H 6100 6075 50  0001 C CNN
F 1 "PWR_FLAG" H 6100 6173 50  0000 C CNN
F 2 "" H 6100 6000 50  0001 C CNN
F 3 "~" H 6100 6000 50  0001 C CNN
	1    6100 6000
	1    0    0    -1  
$EndComp
$Comp
L power:VCC #PWR0104
U 1 1 5E8348F1
P 6100 6000
F 0 "#PWR0104" H 6100 5850 50  0001 C CNN
F 1 "VCC" H 6118 6173 50  0000 C CNN
F 2 "" H 6100 6000 50  0001 C CNN
F 3 "" H 6100 6000 50  0001 C CNN
	1    6100 6000
	-1   0    0    1   
$EndComp
NoConn ~ 3700 1150
Wire Wire Line
	4250 3300 4250 4300
$Comp
L Connector_Generic:Conn_02x03_Odd_Even J12
U 1 1 5E8DF5D9
P 4450 4400
F 0 "J12" H 4500 4717 50  0000 C CNN
F 1 "Conn_02x03_Odd_Even" H 4500 4626 50  0000 C CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_2x03_P2.54mm_Vertical" H 4450 4400 50  0001 C CNN
F 3 "~" H 4450 4400 50  0001 C CNN
	1    4450 4400
	1    0    0    -1  
$EndComp
Wire Wire Line
	4250 4400 4250 4500
Wire Wire Line
	4250 4400 4250 4300
Connection ~ 4250 4400
Connection ~ 4250 4300
Wire Wire Line
	1900 4200 1900 5200
$Comp
L Connector_Generic:Conn_02x03_Odd_Even J11
U 1 1 5E8EA2C2
P 2100 5300
F 0 "J11" H 2150 5617 50  0000 C CNN
F 1 "Conn_02x03_Odd_Even" H 2150 5526 50  0000 C CNN
F 2 "Connector_PinHeader_2.54mm:PinHeader_2x03_P2.54mm_Vertical" H 2100 5300 50  0001 C CNN
F 3 "~" H 2100 5300 50  0001 C CNN
	1    2100 5300
	1    0    0    -1  
$EndComp
Wire Wire Line
	1900 5300 1900 5400
Wire Wire Line
	1900 5300 1900 5200
Connection ~ 1900 5300
Connection ~ 1900 5200
$EndSCHEMATC