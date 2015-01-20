#
# A first crack at parsing the data into reasonable information
#

import csv
import argparse

optionsParser = argparse.ArgumentParser()

optionsParser.add_argument('--inputFile', '-i', required=True, default='./input.txt', help="Input file")
optionsParser.add_argument('--season', '-s', required=True, default='./input.txt', help="Format XXXX-XXXX")

args = optionsParser.parse_args()

def PrintOptions():
    print "output: " + args.config

def find_between( s, first, last ):
    try:
        start = s.index( first ) + len( first )
        end = s.index( last, start )
        return s[start:end]
    except ValueError:
        return ""

def loadData():
    print args.inputFile
    file = open(args.inputFile)
    reader = csv.reader(file, delimiter="\t")
    d = list(reader)

    for row in d:

        gameID = row[0]
        seqID = row[1]
        time = row[2]
        event = row[3]
        tokens = event.split()
        playerName = ""
        teamID = "" 
        eventType = "" 
        specificEventType = "NA"
        season = args.season

        # parse data in/near brackets
        for token in tokens:
            if "[" not in token and "]" not in token:
                playerName = token
                break
            elif "[" in token:
                teamID = token.replace("[", "")
                teamID = teamID.replace("]", "")

        # Process gneral event info
        for token in tokens:
            #print token
            if "Substitution" in token:
                eventType = "Sub"
                break
            if "Throw" in token:
                eventType = "FT"
                break
            if "Turnover" in token:
                eventType = "TO"
                break
            elif "Foul" in token:
                eventType = "Foul"
                break
            elif "Rebound" in token:
                eventType = "Reb"
                break
            elif "Assist" in token:
                eventType = "Shot(Assisted)"
                break
            elif "Shot" in token:
                eventType = "Shot"
                specificEventType = find_between(event, playerName, "Shot")

        if eventType:
            print                       \
                    gameID + "\t" +     \
                    seqID + "\t" +      \
                    season + "\t" +     \
                    time + "\t" +       \
                    teamID + "\t" +     \
                    playerName + "\t" + \
                    eventType + "\t" +  \
                    specificEventType

def main():
    loadData()

if __name__ == "__main__": main()

