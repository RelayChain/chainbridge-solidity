#!/bin/bash

for original in $(find contracts/* -type d); do
    new_foldername="flattened/$(echo $original | cut -c11-)"
    mkdir -p $new_foldername
done

for original in $(find contracts -name "*.sol"); do
    new_filename="flattened/$(echo $original | cut -c11-)"
    npx truffle-flattener $original > $new_filename
done
