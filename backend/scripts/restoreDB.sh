#!/bin/bash
# Restore MySQL database
mysql -u$DB_USER -p$DB_PASSWORD -h$DB_HOST $DB_NAME < $1
