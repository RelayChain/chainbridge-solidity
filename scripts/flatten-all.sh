#!/bin/bash

for original in $(find contracts/* -type d); do
contractless=$(echo $original | cut -c11-)
    new_foldername="flattened/$contractless"
    mkdir -p $new_foldername

    new_foldername="json-inputs/$contractless"
    mkdir -p $new_foldername
done

for original in $(find contracts -name "*.sol"); do
    contractless=$(echo $original | cut -c11-)
    new_filename="flattened/$contractless"
    npx truffle-flattener $original > $new_filename

    new_filename="json-inputs/${contractless%.sol}.json"
    npx node scripts/solidity-json-input.js $contractless > $new_filename
done
