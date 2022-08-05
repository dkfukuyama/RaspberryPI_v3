#!/bin/sh

date
curl -H "Content-Type: application/json" -d '{"alert_text" : "よていをよみあげます", "mode" : "cal_today", "return_type" : "text"}' localhost:8091/command -XPOST

