# This will serve external media as a website at http://localhost:5000
# You can use that URL as a remote-media development path.
# (Unlike the command we use on Windows, this can be killed with Ctrl+C on unix.)

echo "Starting webserver at http://localhost:5000"
echo "Press Ctrl+C to stop"
ruby -rwebrick -e'WEBrick::HTTPServer.new(:Port => 5000, :DocumentRoot => Dir.pwd).start'
