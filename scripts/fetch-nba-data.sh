#!/bin/bash

#
# Script to fetch and extract all data
#

#
# AllData20070420.                -> 06-07-regular
# AllData2007playoffs20081211.    -> 06-07-playoff
# AllData20072008reg20081211.     -> 07-08-regular
# AllData2008playoffs20081211.    -> 07-08-playoff
# AllData20082009reg20090420.     -> 08-09-regular
# AllData20090614.                -> 08-09-playoff
# AllData20092010reg20100418.     -> 09-10-regular
# AllData2010playoffs20101101.    -> 09-10-playoff
# AllData20102011reg20110416.     -> 10-11-regular
# AllData2011playoffs20111224.    -> 10-11-playoff
#
declare -a NEW_NAMES=(         \
"unused1" \
"10-11-playoff" \
"10-11-regular" \
"09-10-playoff" \
"10-11-regular" \
"09-10-playoff" \
"09-10-regular" \
"08-09-playoff" \
"08-09-regular" \
"07-08-playoff" \
"07-08-regular" \
"06-07-playoff" \
"06-07-regular" \
"unused2" \
)

# We want the script to fail on any error
set -o errexit
set -o nounset

# Download the webpage with all the download links
# Note that if the page at this URL changes, the "NEW_NAMES" array may need to be updated
DOWNLOADS_HTML="http://basketballvalue.com/downloads.php"
DOWNLOADS_FILE="downloads.php"
echo "Downloading ${DOWNLOADS_HTML} to ${DOWNLOADS_FILE}"
wget -O "${DOWNLOADS_FILE}" "${DOWNLOADS_HTML}" &> /dev/null 

# Extract the download links
ALL_DOWNLOAD_URLS=`cat ${DOWNLOADS_FILE} | grep AllData | grep -o 'http.*zip'`
echo "----"
echo "ALL VALID DOWNLOAD URLS:"
echo "${ALL_DOWNLOAD_URLS}"
echo "----"

# Clean up 
rm -f downloads.php
rm -rf download

# change directories
mkdir ./download || true
pushd ./download

COUNT=0
# Download and unzip each full data set
for URL in ${ALL_DOWNLOAD_URLS}; do
    OUTPUT_DIR_NAME=`echo "${URL}" | grep -o 'AllData.*\.'`
    TEMP_ZIP_FILE="file.zip"

    rm -r "${NEW_NAMES[$COUNT]}" || true
    
    echo "Downloading ${URL} to ${TEMP_ZIP_FILE}"
    wget -O "${TEMP_ZIP_FILE}" "${URL}" &> /dev/null
    
    echo "Extracting ${TEMP_ZIP_FILE} int directory ${NEW_NAMES[$COUNT]}"
    unzip -d "./${NEW_NAMES[$COUNT]}" "${TEMP_ZIP_FILE}" &> /dev/null
    
    rm -f "${TEMP_ZIP_FILE}"
    COUNT=$((COUNT+1))
done

rm -r unused* || true

popd

echo "DONE!"

