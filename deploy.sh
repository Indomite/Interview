#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

git init
git add -A
git commit -m "`date +%Y.%m.%d`"

# 如果发布到 https://<USERNAME>.github.io
git push -f git@github.com:Indomite/StudySchedule.git master

cd -