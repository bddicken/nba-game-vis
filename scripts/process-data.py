#
# A first crack at parsing the data into reasonable information
#
# TODO:
#   Properly close files
#

from __future__ import print_function
import csv
import argparse
import fnmatch
import os
import sys

optionsParser = argparse.ArgumentParser()

optionsParser.add_argument('--inputDir', '-i', required=True, default='./data', help="Input dir")
optionsParser.add_argument('--outputDir', '-o', required=True, default='./out_data', help="Output dir")
optionsParser.add_argument('--season', '-s', required=True, default='./input.txt', help="Format XXXX-XXXX")

args = optionsParser.parse_args()

def PrintOptions(self):
    print ("output: " + args.config)

class NBADataProcessor:

    def __init__(self, iDir, oDir, sea):
        self.inputDir = iDir
        self.outputDir = oDir
        self.season = sea

    def find_between(self, s, first, last ):
        try:
            start = s.index( first ) + len( first )
            end = s.index( last, start )
            return s[start:end]
        except ValueError:
            return ""

    def getOutputFileNamesOrDie(self):
        rootAbsPath = os.path.abspath(self.outputDir);
        self.pbpOutputFileName = rootAbsPath + "/pbp.txt"
        self.pbpOutputFile = open(self.pbpOutputFileName, 'a+')
        self.playersOutputFileName = rootAbsPath + "/players.txt"
        self.playersOutputFile = open(self.playersOutputFileName, 'a+')

    def getInputFileNamesOrDie(self):
        rootAbsPath = os.path.abspath(self.inputDir)
        for file in os.listdir(rootAbsPath):
            if fnmatch.fnmatch(file, '*playbyplay*'):
                self.pbpInputFileName = rootAbsPath + "/" + file
                self.pbpInputFile = open(self.pbpInputFileName, 'r+')
            if fnmatch.fnmatch(file, '*players2*'):
                self.playersInputFileName = rootAbsPath + "/" + file
                self.playersInputFile = open(self.playersInputFileName, 'r+')

        if not self.playersInputFile or not self.pbpInputFile:
            print ("Failed to get all input files")
            sys.exit(1)
    
    def processPlayersData(self):

        readerExisting = csv.reader(self.playersOutputFile, delimiter="\t")
        dExisting = list(readerExisting)
        reader = csv.reader(self.playersInputFile, delimiter="\t")
        d = list(reader)

        # populate map for already computed players
        self.players = {'':-1}
        counter=0
        iterd = iter(dExisting)
        if len(dExisting) > 0:
            next(iterd)
        for row in iterd:
            playerID = row[0]
            playerName = row[1]
            self.players[playerName] = playerID
            counter = max(counter, int(float(playerID)))
        counter = counter + 1

        iterd = iter(d)
        next(iterd)
        if len(dExisting) > 0:
            next(iterd)
        for row in iterd:
            playerID = row[0]
            playerName = row[1]
            playerTrueName = row[2]
            if playerName not in self.players:
                print(                        \
                        str(counter) + "\t" + \
                        playerName   + "\t" + \
                        playerTrueName,       \
                        file=self.playersOutputFile)
                self.players[playerName] = int(counter)
                counter = counter + 1

    def processPBPData(self):

        #for k1 in self.players:
            #print(">" + k1 + "<")

        reader = csv.reader(self.pbpInputFile, delimiter="\t")
        d = list(reader)

        for row in d:

            # The imprtant bits of PBP data
            gameID = row[0]
            seqID = row[1]
            time = row[2]
            event = row[3]
            tokens = event.split()
            playerName = ""
            playerID = -1
            teamID = "" 
            eventType = "" 
            specificEventType = "NA"
            season = self.season

            # parse data in/near brackets
            for token in tokens:
                if "[" not in token and "]" not in token:
                    playerName = playerName + " " + token
                    playerName = playerName.strip()
                    if playerName in self.players:
                        break
                elif "[" in token:
                    teamID = token.replace("[", "")
                    teamID = teamID.replace("]", "")

            # Process gneral event info
            for token in tokens:
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
                    specificEventType = self.find_between(event, playerName, "Shot")


            if not eventType or playerName not in self.players:
                continue
            
            playerID = self.players[playerName]

            print(                           \
                    gameID          + "\t" + \
                    seqID           + "\t" + \
                    season          + "\t" + \
                    time            + "\t" + \
                    teamID          + "\t" + \
                    playerName      + "\t" + \
                    str(playerID)   + "\t" + \
                    eventType       + "\t" + \
                    specificEventType,       \
                    file=self.pbpOutputFile)

def processAll():
    rootAbsPath = os.path.abspath(args.inputDir)

    for dir_name in os.listdir(rootAbsPath):

        inDir = rootAbsPath + "/" + dir_name

        print("processing = " + dir_name)
        print("inDir = " + inDir)
        print("outDir = " + args.outputDir)

        nbadp = NBADataProcessor(inDir, args.outputDir, args.season)

        nbadp.getOutputFileNamesOrDie()
        nbadp.getInputFileNamesOrDie()
        nbadp.processPlayersData()
        nbadp.processPBPData()
    

def main():
    processAll()

if __name__ == "__main__": main()

