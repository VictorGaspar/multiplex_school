# Multiplex school Plugin

The multiplex school plugin, like the [original multiplex plugin](https://github.com/reveal/multiplex), allows your audience to view the slides of the reveal.js presentation you are controlling on their own phone, tablet or laptop. As the master (called "teacher") presentation navigates the slides, all client ("student") presentations will update in real time.

The multiplex school plugin adds the following features on top of the original multiplex plugin:

- The student presentations can not go further ahead than the teacher presentation. E.g. to not let students access the next slide containing the answer to a question before the teacher reveals it.
- While the teacher stays on a slide, students can navigate freely to previous slides. They will be brought back to the teacher's current slide when the teacher navigates forward.

This plugin is intended for classroom use, where a teacher wants to control the flow of a presentation while still allowing students to review previous material. It replaces traditional pdf slides. To enable students to take notes, consider a third party note-taking app, for example [Hypothesis](https://web.hypothes.is/).

The multiplex school plugin needs the following three things to operate:

1. [Teacher presentation](#teacher-presentation) that has control
2. [Student presentations](#student-presentation) that follow the teacher
3. [Socket.io server](#socketio-server) to broadcast events from the teacher to the students

## Getting Started

1. Navigate to your reveal.js folder
1. `npm install reveal-multiplex-school`
1. `node node_modules/reveal-multiplex-school` to start the socket.io server
1. Follow the instructions below to set up your teacher and student presentations.

### Hosted Server

In the following examples we configure the multiplex plugin to connect to a socket.io server hosted locally. You can find for example an already configured reveal.js folder in the zip file on the Github repository.

After unzipping, navigate to the unzipped folder, install the plugin with `npm install reveal-multiplex-school` and start the socket.io server with `node node_modules/reveal-multiplex-school`. The socket.io server will be hosted at `http://localhost:1948/` and will serve both the teacher and student presentations at `http://localhost:1948/teacher.html` and `http://localhost:1948/student.html` respectively.

If after opening the teacher and student presentations in two browsers, changes made in the teacher presentation are not reflected in the student presentation, make sure that when opening a presentation, a message 'Connection opened' appears in the terminal where the socket.io server is running. If not, check that the url in the configuration matches the url where the socket.io server is running. You can also try to update the secret and id by visiting `http://localhost:1948/token`.

## Teacher Presentation

The teacher presentation file only needs to be on the teacher computer. It's safer to run the teacher presentation from the teacher's computer, so if the venue's Internet goes down it doesn't stop the show, and to avoid students accessing the teacher presentation. An example would be to execute the following commands in the directory of the teacher presentation:

1. `npm install node-static`. We advise the teacher to install the static server globally with `npm install -g node-static` so that the `static` command is available from anywhere.
2. `static`

You can then access the teacher presentation at `http://localhost:8080`. The port number '8080' may defer.

Example configuration:

```javascript
Reveal.initialize({
  multiplex: {
    // Example values. To generate your own, see the socket.io server instructions.
    secret: '13652805320794272084', // Obtained from the socket.io server. Gives this (the teacher) control of the presentation
    id: '1ea875674b17ca76', // Obtained from socket.io server
    url: 'http://localhost:1948/' // Location of socket.io server
  },

  // Don't forget to add the dependencies
  dependencies: [
    { src: 'http://localhost:1948/socket.io/socket.io.js', async: true },
    { src: 'http://localhost:1948/node_modules/reveal-multiplex-school/master.js', async: true }
  ]
});
```

## Student Presentation

Served from a publicly accessible static file server such as GitHub Pages or Amazon S3. Your audience can then access the student presentation via `https://example.com/path/to/presentation/student/index.html`, with the configuration below causing them to connect to the socket.io server as students.

Example configuration:

```javascript
Reveal.initialize({
  multiplex: {
    // Example values. To generate your own, see the socket.io server instructions.
    secret: null, // null so the students do not have control of the teacher presentation
    id: '1ea875674b17ca76', // id, obtained from socket.io server
    url: 'http://localhost:1948/' // Location of socket.io server
  },

  // Don't forget to add the dependencies
  dependencies: [
    { src: 'http://localhost:1948/socket.io/socket.io.js', async: true },
    { src: 'http://localhost:1948/node_modules/reveal-multiplex-school/client.js', async: true }
  ]
});
```

## Socket.io Server

Server that receives the `slideChanged` events from the teacher presentation and broadcasts them out to the connected student presentations. This needs to be publicly accessible. You can run your own socket.io server with `node node_modules/reveal-multiplex`.

You'll need to generate a unique secret and token pair for your teacher and student presentations. To do so, visit `https://example.com/token`, where `https://example.com` is the location of your socket.io server.

### socket.io server as file static server

The socket.io server can play the role of static file server for your student presentation, as in the zip file.

It can also play the role of static file server for your teacher presentation and student presentations at the same time. But students would then be able to access the teacher presentation if the teacher presentation url is exposed, for example by showing the teacher presentation not in full screen mode. To avoid this, it's better to serve the teacher presentation from the teacher's computer as explained above.

## Future possible improvements

- Save the current slide number in the socket.io server, so that students connecting late, refreshing the page, or connecting after the course, can have access to all the slides up to the current one.
- Changes in the teacher presentation are not reflected in the student presentation if the student is not on the same slide.