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

# Misc

Sample project under MIT - do whatever you want with it :)