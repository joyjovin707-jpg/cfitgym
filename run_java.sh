#!/bin/bash
# C-FIT Fitness Management System — Java Launcher
cd "$(dirname "$0")"
mkdir -p java/bin
echo "[INFO] Compiling C-FIT Java OOP System..."
javac -d java/bin $(find java/src -name "*.java")
if [ $? -ne 0 ]; then
    echo "[ERROR] Compilation failed."
    exit 1
fi

echo ""
echo "Select mode to run C-FIT:"
echo " 1. Console / Terminal Interactive Mode (com.cfit.Main)"
echo " 2. Desktop GUI Mode - Java Swing (com.cfit.gui.GymDesktopApp)"
echo " 3. Pure Java REST API Server on port 8080 (com.cfit.server.GymHttpServer)"
echo ""
read -p "Enter choice [1-3] (Default 1): " choice

case "$choice" in
    2)
        echo "Starting C-FIT Desktop GUI..."
        java -cp java/bin com.cfit.gui.GymDesktopApp
        ;;
    3)
        echo "Starting C-FIT Java HTTP Server on :8080..."
        java -cp java/bin com.cfit.server.GymHttpServer
        ;;
    *)
        echo "Starting C-FIT Console App..."
        java -cp java/bin com.cfit.Main
        ;;
esac
