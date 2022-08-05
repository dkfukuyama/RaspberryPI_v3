#!/bin/sh

date
curl -H "Content-Type: application/json" -d '{"alert_text" : "よていをよみあげます", "mode" : "clean_wav", "return_type" : "text"}' localhost:8091/command -XPOST

