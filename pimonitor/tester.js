let data = 'Apr 18 20:00:03 dnsmasq[266]: exactly blacklisted reddit.com is ::';
data = data.replace(' is ::','');
const parseLine = data.split('blacklisted');
console.log(parseLine[1].replace(' ', ''));