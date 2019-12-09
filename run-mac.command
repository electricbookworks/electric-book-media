# This will serve external media as a website at http://localhost:5000
# You can use that URL as a remote-media development path.
# (Unlike the command we use on Windows, this can be killed with Ctrl+C on unix.)

echo "-------------------------------------------"
echo "Starting webserver at http://localhost:5000"
echo "Press Ctrl+C to stop"
echo "-------------------------------------------"
# ruby -rwebrick -e'WEBrick::HTTPServer.new(:Port => 5000, :DocumentRoot => Dir.pwd).start'
npx http-server -p 5000 --cors

echo "If you get an error, please check that http-server is installed."
echo "You can install it with Node by entering this in the command prompt:"
echo "npm install http-server -g"
