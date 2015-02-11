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
optionsParser.add_argument('--scratchDir', '-s', required=True, default='./scratch_data', help="Scratch dir")
optionsParser.add_argument('--season', '-n', required=True, default='./input.txt', help="Format XX-XX")

args = optionsParser.parse_args()

def PrintOptions(self):
    print ("output: " + args.config)

class NBADataProcessor:

    def __init__(self, iDir, sDir, oDir, sea):

        self.inputDir = iDir
        self.scratchDir = sDir
        self.outputDir = oDir
        self.season = sea
        
        self.gameIDCounter      = 0
        self.teamIDCounter      = 0
        self.playerIDCounter    = 0
        self.gameEventIDCounter = 0
        self.seasonIDCounter    = 0

        self.games      = {}
        self.teams      = {}
        self.players    = {}
        self.gameEvents = {}
        self.seasons    = {}

    def find_between(self, s, first, last ):
        try:
            start = s.index( first ) + len( first )
            end = s.index( last, start )
            return s[start:end]
        except ValueError:
            return ""

    def getOutputFileNamesOrDie(self):
        rootAbsPath = os.path.abspath(self.outputDir);

        self.seasonsOutputFileName = rootAbsPath + "/seasons.txt"
        self.seasonsOutputFile = open(self.seasonsOutputFileName, 'a+')

        self.gameEventsOutputFileName = rootAbsPath + "/gameEvents.txt"
        self.gameEventsOutputFile = open(self.gameEventsOutputFileName, 'a+')

        self.playersOutputFileName = rootAbsPath + "/players.txt"
        self.playersOutputFile = open(self.playersOutputFileName, 'a+')

        self.gamesOutputFileName = rootAbsPath + "/games.txt"
        self.gamesOutputFile = open(self.gamesOutputFileName, 'a+')

        self.teamsOutputFileName = rootAbsPath + "/teams.txt"
        self.teamsOutputFile = open(self.teamsOutputFileName, 'a+')

    def openScratchFilesOrDie(self):
        scratchDirAbs = os.path.abspath(self.scratchDir)
        
        self.gameEventsScratchFileName = scratchDirAbs + "/gameEvents_raw.txt"
        self.gameEventsScratchFile = open(self.gameEventsScratchFileName, 'r+')

        self.playersScratchFileName = scratchDirAbs + "/players_raw.txt"
        self.playersScratchFile = open(self.playersScratchFileName, 'r+')

        self.gamesScratchFileName = scratchDirAbs + "/games_raw.txt"
        self.gamesScratchFile = open(self.gamesScratchFileName, 'r+')

        self.teamsScratchFileName = scratchDirAbs + "/teams_raw.txt"
        self.teamsScratchFile = open(self.teamsScratchFileName, 'r+')

        if not self.gameEventsScratchFile or not self.playersScratchFile or not self.gamesScratchFile or not self.teamsScratchFile :
            print ("Failed to get all input files")
            sys.exit(1)
    
    def printDictToTSV(self, dictionary, fileHandle):
        for key, value in dictionary.iteritems():
            line = ''
            for key2, value2 in value.iteritems():
                line += str(value2) + '\t';
                pass
            print(line,file=fileHandle)
    
    def processSeasonData(self):

        self.gamesScratchFile.seek(0)
        reader = csv.reader(self.gamesScratchFile, delimiter="\t")
        data = list(reader)

        # Skip over first row of input
        iterd = iter(data)
        if len(data) > 0:
            next(iterd)

        for row in iterd:
            seasonName = row[1]
            seasonID = self.seasonIDCounter

            if seasonName not in self.seasons:
                season = {'name': str(seasonName), 'id': str(seasonID) }
                self.seasons[seasonName] = season
                self.seasonIDCounter = self.seasonIDCounter + 1
    
    def processGameData(self):

        self.gamesScratchFile.seek(0)
        reader = csv.reader(self.gamesScratchFile, delimiter="\t")
        data = list(reader)

        # Skip over first row of input
        iterd = iter(data)
        if len(data) > 0:
            next(iterd)

        for row in iterd:
            gameYear = row[1]
            gameDate = row[2]
            gameStringID = row[3]
            homeTeam = ''
            awayTeam = ''

            if (len(row) >= 10):
                homeTeam = row[7]
                awayTeam = row[9]
            else:
                # TODO: log error
                pass

            gameID = self.gameIDCounter

            if gameStringID not in self.games:
                game = {'season': str(gameYear), 'date': str(gameDate), 'name': str(gameStringID), 'homeTeam': str(homeTeam), 'awayTeam': str(awayTeam), 'id': str(gameID)}
                self.games[gameStringID] = game
                self.gameIDCounter = self.gameIDCounter + 1
    
    def processTeamData(self):

        self.teamsScratchFile.seek(0)
        reader = csv.reader(self.teamsScratchFile, delimiter="\t")
        data = list(reader)

        # Skip over first row of input
        iterd = iter(data)
        if len(data) > 0:
            next(iterd)

        for row in iterd:
            teamName = row[0]
            teamID = self.teamIDCounter
            if teamName  not in self.teams:
                team = {'name': str(teamName), 'id': str(teamID)}
                self.teams[teamName] = team
                self.teamIDCounter = self.teamIDCounter + 1
    
    def processPlayerData(self):

        self.playersScratchFile.seek(0)
        reader = csv.reader(self.playersScratchFile, delimiter="\t")
        data = list(reader)

        # Skip over first row of input
        iterd = iter(data)
        if len(data) > 0:
            next(iterd)

        for row in iterd:
            # not modeling player's team for now.
            playerName = row[1]
            playerTrueName = row[2]
            playerID = self.playerIDCounter
             
            if playerName not in self.players:
                player = {'name': str(playerName), 'trueName': str(playerTrueName), 'id': str(playerID)}
                self.players[playerName] = player
                self.playerIDCounter = self.playerIDCounter + 1
    
    def processGameEventData(self):

        self.gameEventsScratchFile.seek(0)
        reader = csv.reader(self.gameEventsScratchFile, delimiter="\t")
        d = list(reader)

        for row in d:

            if len(row) < 4:
                # TODO: log error
                continue

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
            
            playerID = self.players[playerName]['id']

            gameEvent = {
                'gameID':        gameID,         \
                'seqID':         seqID,          \
                'season':        season,         \
                'time':          time,           \
                'teamID':        teamID,         \
                'playerName':    playerName,     \
                'playerID':      str(playerID),  \
                'eventType':     eventType,      \
                'specEventType': specificEventType, \
                'id': self.gameEventIDCounter    \
            }
            self.gameEvents[str(self.gameEventIDCounter)] = gameEvent
            self.gameEventIDCounter = self.gameEventIDCounter + 1


    def printPlayerData(self):
        self.printDictToTSV(self.players, self.playersOutputFile)
    
    def printGameData(self):
        self.printDictToTSV(self.games, self.gamesOutputFile)
    
    def printTeamData(self):
        self.printDictToTSV(self.teams, self.teamsOutputFile)
    
    def printGameEventData(self):
        self.printDictToTSV(self.gameEvents, self.gameEventsOutputFile)
    
    def printSeasonData(self):
        self.printDictToTSV(self.seasons, self.seasonsOutputFile)

def generateScratchFilesOnDisk(inputDir, scratchDir):

    rootAbsPath = os.path.abspath(inputDir)
    scratchDirAbs = os.path.abspath(scratchDir)

    gameEventsRawFileName = scratchDirAbs + "/gameEvents_raw.txt"
    playersRawFileName = scratchDirAbs + "/players_raw.txt"
    gamesRawFileName = scratchDirAbs + "/games_raw.txt"
    teamsRawFileName = scratchDirAbs + "/teams_raw.txt"
    
    gameEventsRawFile = open(gameEventsRawFileName, 'a+')
    playersRawFile = open(playersRawFileName, 'a+')
    gamesRawFile = open(gamesRawFileName, 'a+')
    teamsRawFile = open(teamsRawFileName, 'a+')

    # combine all files
    for dirName in os.listdir(rootAbsPath):
        for fileName in os.listdir(rootAbsPath + '/' + dirName):
            inputFileName = rootAbsPath + '/' + dirName + "/" + fileName
            inputFile = open(inputFileName, 'r+')
            if fnmatch.fnmatch(fileName, '*gamelist*'):
                gamesRawFile.write(inputFile.read())
            elif fnmatch.fnmatch(fileName, '*teamstats*'):
                teamsRawFile.write(inputFile.read())
            elif fnmatch.fnmatch(fileName, '*playbyplay*'):
                gameEventsRawFile.write(inputFile.read())
            elif fnmatch.fnmatch(fileName, '*players2*'):
                playersRawFile.write(inputFile.read())
    
    
def processAll():

    print("inDir = " + args.inputDir)
    print("scratchDir = " + args.scratchDir)
    print("outDir = " + args.outputDir)
    
    generateScratchFilesOnDisk(args.inputDir, args.scratchDir)

    nbadp = NBADataProcessor(args.inputDir, args.scratchDir, args.outputDir, args.season)

    nbadp.openScratchFilesOrDie()
    nbadp.getOutputFileNamesOrDie()

    nbadp.processGameData()
    nbadp.printGameData()
    
    nbadp.processSeasonData()
    nbadp.printSeasonData()
    
    nbadp.processTeamData()
    nbadp.printTeamData()
    
    nbadp.processPlayerData()
    nbadp.printPlayerData()
    
    nbadp.processGameEventData()
    nbadp.printGameEventData()
    

def main():
    processAll()

if __name__ == "__main__": main()

