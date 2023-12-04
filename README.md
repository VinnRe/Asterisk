<div align="center">
  <img alt="Alt text" width="300" height="300" src="src/asterisk/src/Components/Assets/asterisk-logo.png">

  <h1>Asterisk</h1>

  <p>A Video Conference Web Application using JavaScript, NodeJS, and Java.</p>

  <h2>Authors</h2>
  <p>Students from CS - 2102</p>
  <ul>
    <a href="https://github.com/mothy-08">Alimagno, Timothy Dave</a>
    <a href="https://github.com/VinnRe">Capinpin, Kobe Andrew</a>
    <a href="https://github.com/oocim">Cuarto, Mico Raphael</a>
    <a href="https://github.com/herseyy">Odasco, Hersey</a>
  </ul>
</div>

<h2>Demo</h2>
<p>Here is the demo and explanation of the web application. It is a brief explanation about how we used the 4 principles of OOP in this web application.</p>
<p><a href="#">Asterisk - Video Conference Web Application</a></p>

<h2>Features</h2>
<ul>
  <li>Login / Signup</li>
  <li>Working Database</li>
  <li>Chat messaging with the users in the video conference</li>
  <li>Video Conference many-to-many</li>
</ul>

<h2>Installation</h2>
<p><strong>Assuming that you are using VSCode</strong></p>
<p>To try the app you need to follow these steps:</p>

<h3>Create cmds</h3>

<p>First make a new cmd and write these commands.</p>

<pre><code>cd src/asterisk
npm install
</code></pre>

<p>Then make a new cmd and write these commands.</p>

<pre><code>cd src/app
npm install
</code></pre>

<p>Create a new cmd and write these commands as well.</p>

<pre><code>cd src/chatapp
npm install
</code></pre>

<h3>Change the IP to your IP</h3>

<p>Write `ipconfig` in your cmd for the `app` and copy your IPv4 Address.</p>

<p>Go to <code>config.js</code>:</p>

<pre><code>- src
    - app
        - src
            - config.js
</code></pre>

<p>Then edit out the <code>announcedIp</code> from the <code>config.js</code>.</p>

<pre><code>webRtcTransport: {
  listenInfos: [
    {
      protocol: "udp", 
      ip: '0.0.0.0',
      announcedIp: '192.168.0.110' // Replace by public IP address
    }
  ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true
},
</code></pre>

<h2>Running the apps</h2>

<p>These can be run in any order.</p>

<p>Let's run the `app` cmd first; this is the WebRTC API. (cmd should be at the src/app)</p>

<pre><code>npm run start:dev
</code></pre>

<p>Run the `chatapp` cmd; this is the ChatSystem API. (cmd should be at the src/chatapp)</p>

<pre><code>npm run start
</code></pre>

<p>Now let's run the login / signup system; this is the Login / Signup API.</p>

<ul>
  <li>Find the <code>login-system</code> folder then go to this folder:</li>
</ul>

<pre><code>- src
    - login-system
        - src
            - main
                - java
                    - com
                        - burgis
                            - loginsystem
                                - LoginSystemApplication.java
</code></pre>

<ul>
  <li>Now <code>right-click</code> the <code>LoginSystemApplication.java</code> and select Run java. This will create a new cmd.</li>
</ul>

<p>Now let's run the main react app (cmd should be at the src/asterisk).</p>

<pre><code>npm start
</code></pre>

<p>Now with all that, it should run a <code>localhost</code> in your browser and you can use it.</p>
