# This will serve external media as a website at http://localhost:5000
# You can use that URL as a remote-media development path.

echo "Starting webserver at http://localhost:5000"
echo "Press Ctrl+C to stop"
ruby -rwebrick -e'WEBrick::HTTPServer.new(:Port => 5000, :DocumentRoot => Dir.pwd).start'
