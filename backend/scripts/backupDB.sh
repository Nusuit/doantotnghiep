#!/bin/bash
# Backup MySQL database
mysqldump -u$DB_USER -p$DB_PASSWORD -h$DB_HOST $DB_NAME > backup_$(date +%F_%T).sql
