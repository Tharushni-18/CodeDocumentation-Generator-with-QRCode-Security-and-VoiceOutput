# Code Documentation Generator with QR Code Security and Voice Output

A frontend-only tool that turns pasted source code into simple documentation: language detection, code statistics, a SHA-256 integrity hash, a QR code, a downloadable text file, and spoken playback.

## Features
- Detects Java, Python, JavaScript, C and C++
- Explains the code in plain English: an overview plus what each line does
- Real QR code containing the overview and timestamp; downloadable as PNG
- Save to localStorage, download as documentation.txt
- Voice output of saved documentation

## Technologies
HTML, CSS, JavaScript, QRCode.js (CDN), Web Speech API, LocalStorage

## How it works
1. Paste code on the generator page and click Generate Documentation.
2. JavaScript regex rules explain each line and build an overview; QRCode.js draws the QR.
3. Click Save Documentation to store it in localStorage.
4. Open Voice Output to hear the saved documentation.

## Project structure
```
code-documentation-generator/
├── index.html
├── generator.html
├── voice.html
├── style.css
├── script.js
└── README.md
```

## How to run
Open `index.html` in a browser, or use VS Code Live Server. No backend is required. (QR generation needs internet for the CDN script.)
