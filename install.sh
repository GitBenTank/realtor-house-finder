#!/bin/bash

# Realtor House Finder - Installation Script
# This script automates the setup process

echo "🏡 Realtor House Finder - Installation Script"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create exports directory
echo "📁 Creating exports directory..."
mkdir -p exports

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file and add your RapidAPI key"
else
    echo "✅ .env file already exists"
fi

# Check if .env has API key
if grep -q "your_rapidapi_key_here" .env; then
    echo "⚠️  WARNING: Please update your RapidAPI key in .env file"
    echo "   Edit .env and replace 'your_rapidapi_key_here' with your actual API key"
fi

echo ""
echo "🎉 Installation completed!"
echo ""
echo "Next steps:"
echo "1. Get your RapidAPI key from https://rapidapi.com/"
echo "2. Edit .env file and add your API key"
echo "3. Run: npm start"
echo "4. Open: http://localhost:3000"
echo ""
echo "For detailed setup instructions, see SETUP_GUIDE.md"


