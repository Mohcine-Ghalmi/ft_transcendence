#!/bin/sh -eu
keys=`redis-cli keys '*'`
if [ "$keys" ]; then
    echo "$keys" | while IFS= read -r key; do
        type=`echo | redis-cli type "$key"`
        case "$type" in
            string) value=`echo | redis-cli get "$key"`;;
            hash) value=`echo | redis-cli hgetall "$key"`;;
            set) value=`echo | redis-cli smembers "$key"`;;
            list) value=`echo | redis-cli lrange "$key" 0 -1`;;
            zset) value=`echo | redis-cli zrange "$key" 0 -1 withscores`;;
        esac
        echo "> $key ($type):"
        echo "$value" | sed -E 's/^/    /'
    done
fi