 Code Documentation Generator with QR Code Security and Voice Output

A beginner-friendly frontend web application that converts pasted source code into simple and readable documentation.
The tool detects the programming language, analyzes basic code statistics, generates a SHA-256 integrity hash, creates a QR code containing documentation details, allows the documentation to be downloaded, and provides voice playback using the Web Speech API.

 ✨ Features

  1. Programming Language Detection

  * Java
  * Python
  * JavaScript
  * C
  * C++

  2. Automatic Code Documentation

  * Generates a simple overview of the source code
  * Explains individual lines of code in plain English

  3. Code Statistics

  * Number of lines
  * Number of characters
  * Basic code information

  4. SHA-256 Security Hash

  * Generates a SHA-256 hash for the entered source code
  * Helps verify the integrity of the code

  5. QR Code Generation

  * Generates a QR code containing the documentation overview and timestamp
  * QR code can be downloaded as a PNG image

  6. Save Documentation

  * Saves generated documentation using browser LocalStorage

    ✰ Download Documentation

  * Downloads the generated documentation as `documentation.txt`

  7. Voice Output

  * Reads saved documentation aloud using the Web Speech API

 ✨Technologies Used

| Technology     | Purpose                             |
| -------------- | ----------------------------------- |
| HTML5          | Structure of the web pages          |
| CSS3           | Styling and responsive design       |
| JavaScript     | Code analysis and application logic |
| QRCode.js      | QR code generation                  |
| Web Speech API | Voice output                        |
| LocalStorage   | Saving documentation                |
| SHA-256        | Code integrity hashing              |

 ✨Project Structure

```text 
code-documentation-generator/
│
├── index.html
├── generator.html
├── voice.html
├── style.css
├── script.js
└── README.md
```

 ✨ How It Works

   1. Enter Source Code

Open the generator page and paste your source code into the input area.

   2. Generate Documentation

Click **Generate Documentation**.

JavaScript analyzes the entered code and:

* Detects the programming language
* Calculates basic code statistics
* Generates an overview
* Explains the code line by line
* Creates a SHA-256 hash
* Generates a QR code

   3. Save Documentation

Click **Save Documentation** to store the generated documentation in the browser's LocalStorage.

   4. Download Documentation

The generated documentation can be downloaded as:

```text
documentation.txt
```

   5. Voice Output

Open the **Voice Output** page and use the saved documentation to hear the generated explanation through the browser's speech synthesis feature.

   6.QR Code and Security

The application generates a **SHA-256 hash** from the entered source code.

The hash can be used as an integrity identifier to check whether the source code has changed.

The QR code contains useful documentation information such as:

* Code overview
* Timestamp
* Documentation details

> Note: The SHA-256 hash is used for integrity verification. It is not encryption and does not protect the source code from being viewed.


 ✨Limitations

* Code explanation is based on predefined JavaScript rules and patterns.
* It is not a full compiler or advanced AI-based code analysis system.
* Complex programs may not receive detailed explanations for every line.
* Voice output depends on browser support.
* Documentation is stored locally in the browser using LocalStorage.

 ✨Future Enhancements

Possible future improvements include:

*  AI-based code explanation
*  Support for more programming languages
*  PDF documentation export
*  Improved UI and dark mode
*  Shareable documentation links
*  Database support
*  User authentication
*  Advanced code statistics
*  Integration with a Generative AI API

 ✨ Learning Outcomes

This project helped in understanding:

* Frontend web development
* JavaScript DOM manipulation
* Regular expressions
* LocalStorage
* QR code generation
* SHA-256 hashing
* Web Speech API
* File downloading using JavaScript
* Responsive web design
* Basic source-code analysis
  

