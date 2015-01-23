-- TODO Finish schema!

CREATE TABLE player(
    PlayerID integer primary key,
    PlayerName varchar(32),
    PlayerTrueName varchar(64)
)
;

CREATE TABLE playbyplay (
    GameID varchar(32),
    PlayID integer,
    Season varchar(16),
    TimeRemaining varchar(16),
    TeamID varchar(16),
    PlayerName varchar(32),
    PlayerID integer references player(PlayerID),
    Event varchar(16),
    EventDetail varchar(64)
)
;

