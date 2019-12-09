:: Don't show these commands to the user
@echo off
:: Keep variables local, and expand at execution time not parse time
setlocal enabledelayedexpansion
:: Set the title of the window
title Electric Book Media webserver

:: This will serve external media as a website at http://localhost:5000
:: You can use that URL as a remote-media development path.
:: (See http://www.benjaminoakes.com/2013/09/13/ruby-simple-http-server-minimalist-rake/)

echo -------------------------------------------
echo Starting webserver at http://localhost:5000
echo Press Ctrl+C to stop
echo -------------------------------------------
npx http-server -p 5000 --cors

echo If you get an error, please check that http-server is installed.
echo You can install it with Node by entering this in the command prompt:
echo npm install http-server -g
