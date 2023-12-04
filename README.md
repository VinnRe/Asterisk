![Alt text](src/asterisk/src/Components/Assets/asterisk-logo.png)
# Asterisk

A Video Conference Web Application using JavaScript, NodeJS, and Java.


## Authors
Students from CS - 2102
- [Alimagno, Timothy Dave](https://github.com/mothy-08)
- [Capinpin, Kobe Andrew](https://github.com/VinnRe)
- [Cuarto, Mico Raphael](https://github.com/oocim)
- [Odasco, Hersey](https://github.com/herseyy)


## Demo

Here is the demo and explantion of the web application. It is a breif explantion about how we used the 4 principles of OOP in this web application.

[Asterisk - Video Conference Web Application]()


## Features

- Login / Signup
- Working Database
- Chat messaging with the users in the video conference
- Video Conference many-to-many



## Installation
**Assuming that you are using VSCode** \
To try the app you need to follow these steps:
### Create cmds
- First make a new cmd and write this commands.
```
    cd src/asterisk
    npm install
```

- Then make a new cmd and write these commands.
```
    cd src/app
    npm install
```

- Create a new cmd and write these commands as well.
```
    cd src/chatapp
    npm install
```
### Change the IP to your IP
Write `ipconfig` to your cmd for the `app` and copy your IPv4 Address.
- Go to `config.js`:
```
    - src
        - app
            - src
                - config.js
```
- Then edit out the `announcedIp` from the `config.js`.
```
    webRtcTransport: {
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
```

## Running the apps
These can be ran in any order
- Let's run the `app` cmd first, this is the WebRTC API. (cmd should be at the src/app)
```
    npm run start:dev
```

- Run the `chatapp` cmd, this is the ChatSystem API. (cmd should be at the src/chatapp)
```
    npm run start
```

- Now let's run the login / signup system, this is the Login / Signup API.
    - Find the `login-system` folder then go to this folder:
    ```
        - src
            - login-system
                - src
                    - main
                        - java
                            - com
                                - burgis
                                    - loginsystem
                                        - LoginSystemApplication.java
    ```
    - Now `right-click` the `LoginSystemApplication.java` and select Run java. This will create a new cmd.

- Now let's run the main react app (cmd should be at the src/asterisk).
```
    npm start
```
Now with all that it should run a `localhost` in your browser and you can use it. 