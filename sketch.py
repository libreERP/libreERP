import math

lat1 = 17.4089051*math.pi/180
lon1 = 78.3791676*math.pi/180
lat2 = 17.4092122*math.pi/180
lon2 = 78.4034147*math.pi/180

R = 6371000
psy1 = lat1
psy2 = lat2
deltaPsy = (lat2-lat1)
deltaLambda = (lon2-lon1)

a = math.sin(deltaPsy/2) * math.sin(deltaPsy/2) + math.cos(psy1) * math.cos(psy2) *  math.sin(deltaLambda/2) * math.sin(deltaLambda/2)
c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

d = R * c

print d
