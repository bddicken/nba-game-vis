#
# A first crack at parsing the data into reasonable information
#
# TODO: lots of things!

import csv
import argparse

optionsParser = argparse.ArgumentParser()

optionsParser.add_argument('--inputFile', '-i', required=True, default='./input.xtxt', help="Input file")
args = optionsParser.parse_args()

def PrintOptions():
    print "output: " + args.config

def loadData():
    print args.inputFile
    file = open(args.inputFile)
    reader = csv.reader(file, delimiter="\t")
    d = list(reader)
    for row in d:
        event = row[3]
        time = row[2]
        tokens = event.split()
        playerName = ""
        teamID = "" 
        eventType = "" 
        specificEventType = ""
        
        # Process gneral event info
        for token in tokens:
            #print token
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

        # parse data in/near brackets
        for token in tokens:
            if "[" not in token and "]" not in token:
                playerName = token
                break
            elif "[" in token:
                teamID = token.replace("[", "")
                teamID = teamID.replace("]", "")

        #if "Shot" in event:
        #    if "Made" in event:
        #        print time + "::" + teamID + " " + playerName + " made a shot"
        #    else:
        #        print time + "::" + teamID + " " + playerName + " missed a shot"
        if eventType:
            print time + "::" + teamID + " " + playerName + " executed action: " + eventType
        #else:
        #    print "unknown action"

def main():
    loadData()

if __name__ == "__main__": main()

