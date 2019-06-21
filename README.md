# Overview

Sample Reactjs project to use OCR, an Azure cognitive service:

![Demo](./doc/demo.gif)

# Installation

Clone the rep, then

```sh
npm install
```

Rename *.env-sample* into *.env*, and add both values after provisioning "Computer vision" service on your [portal](https://portal.azure.com).

```js
REACT_APP_BASE_OCR_URL={Endpoint URL}
REACT_APP_BASE_OCR_SECRET={Key}
```

Start the server

```sh
HTTPS=true npm start
```

# Local OCR service

Microsoft proposes some of the [cognitive services as docker images](https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-container-supportà) - so that, nothing is sent to Azure. This sample project also supports this mode, however, it requires a bit of configuration.

First thing first,
1. [Request access](https://docs.microsoft.com/en-us/azure/cognitive-services/cognitive-services-container-support#container-availability-in-azure-cognitive-services) to the repo that host these images (pick the service you want to use, for this tool, it will be *Recognize text*)
2. Follow the guide to launch the docker image

You can now proceed with this application configuration. Edit the .env file, and add the container endpoint, which is by default the one below:

```js
REACT_APP_LOCAL_ENDPOINT=http://localhost:5000/vision/v2.0/recognizeTextDirect?mode=printed
```

As you can see, the mode used is **printed**. As of today (June 2019), this is the only supported mode.

Then, in order to make everything work, we need to take care of CORS. Today, this image does not support it, and we are consuming services in JavaScript (if you do not know what CORS mean, [go there](https://fr.wikipedia.org/wiki/Cross-origin_resource_sharingà)).

So to solve this, let's add a proxy to route our requests "server mode".

I have used this [simple, and yet powerfull project](https://github.com/Rob--W/cors-anywhere) to achieve this.

1. Create a folder somewehre on your hard drive
2. Clone the following project, install dependencies and start it

```sh
git clone https://github.com/Rob--W/cors-anywhere.git
cd cors-anywhere
npm install
npm start
```

The proxy, by default, should listen on http://localhost:8080

Go back the the *.env* file, and add the following parameter (adapating the URL if you have changed it)

```js
REACT_APP_LOCAL_CORS_PROXY=http://localhost:8080/
```

You can now try the **OCR Local** version!

# Misc

Sample project under MIT - do whatever you want with it :)