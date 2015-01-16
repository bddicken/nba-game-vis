#!/bin/bash

#
# Script to fetch and extract all data
#

# We want the script to fail on any error
set -o errexit
set -o nounset

# Download the webpage with all the download links
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
mkdir ./download
pushd ./download

# Download and unzip each full data set
for URL in ${ALL_DOWNLOAD_URLS}; do
    OUTPUT_DIR_NAME=`echo "${URL}" | grep -o 'AllData.*\.'`
    TEMP_ZIP_FILE="file.zip"
    rm -rf "${OUTPUT_DIR_NAME}"
    echo "Downloading ${URL} to ${TEMP_ZIP_FILE}"
    wget -O "${TEMP_ZIP_FILE}" "${URL}" &> /dev/null
    echo "Extracting ${TEMP_ZIP_FILE} int directory ${OUTPUT_DIR_NAME}"
    unzip -d "${OUTPUT_DIR_NAME}" "${TEMP_ZIP_FILE}" &> /dev/null
    rm -f "${TEMP_ZIP_FILE}"
done

popd

echo "DONE!"

