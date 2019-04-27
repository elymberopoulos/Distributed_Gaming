# Distributed_Gaming

[![Build Status](https://travis-ci.com/elymberopoulos/Distributed_Gaming.svg?branch=master)](https://travis-ci.com/elymberopoulos/Distributed_Gaming)

## About This Project

This project runs a JavaScript Gameboy emulator on a Node.js Express server that uses websockets to emit frames of the game to connected participants. This program also uses simple-peer from NPM to establish peer to peer connections between broswers in the event of a server crash. Additionally, peer to peer signaling information is saved to IndexedDB so that if a peer to peer connection is lost then the connection information will be saved in the peer's browser.

## Scripts

Run the below scripts in order. The first script installs all the npm packages necessary for the project. The second script created a webpack bundle that is used in the front-end part of the project in the index.html file. Lastly, the third script runs the nodemon server for localhost testing. The default port that it launches to is 127.0.0.1:8080.

1. "npm run install"
2. "npm run webpack"
3. "npm run dev"

## Tests

To run the tests it depends on if you are running a server already or not. If the server is already running.

"npm run test"

Else you can launch the server and the tests together.

"npm run combinedtest"

## Notable Frameworks and Technologies Used

* Express.js *: A server framework for Node.js.*
* Socket.io *: used to implement web sockets to connect clients to the server with web RTC.*
* Webpack *: It is a module bundler primarily for JavaScript, but it can transform front-end assets like HTML, CSS, even images if the corresponding plugins are included. Webpack takes modules with dependencies and generates static assets representing those modules.*
* Mocha *: Mocha is a JavaScript testing framework.*
* Tavis CI *: used for continuous integration in testing code in various environments.*
