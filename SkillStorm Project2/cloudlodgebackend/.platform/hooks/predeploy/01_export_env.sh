#!/bin/bash
set -e

ENV_FILE="/opt/elasticbeanstalk/deployment/env"
if [ -f "$ENV_FILE" ]; then
  # export all variables in that file for processes started after this
  set -a
  source "$ENV_FILE"
  set +a
fi
