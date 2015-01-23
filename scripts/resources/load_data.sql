-- TODO Make better!

COPY player FROM 'PLAYERS_FILE_NAME' WITH (format csv, delimiter E'\t')
;
COPY playbyplay FROM 'PBP_FILE_NAME' WITH (format csv, delimiter E'\t')
;

