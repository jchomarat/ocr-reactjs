class ocr {
    constructor(where, file, rawResultsCanvas, visualResultsCanvas) {
        this.isRemote = (where === "remote");
        this.file = file;
        this.rawResultsCanvas = rawResultsCanvas;
        this.visualResultsCanvas = visualResultsCanvas;

        if (this.isRemote) {
            this.service = {
                url: process.env.REACT_APP_BASE_OCR_URL,
                secret: process.env.REACT_APP_BASE_OCR_SECRET
            };
        }
        else {
            this.service = {
                url: `${process.env.REACT_APP_LOCAL_CORS_PROXY}${process.env.REACT_APP_LOCAL_ENDPOINT}`
            }
        
        };
    }

    loadImageAsync() {
        return new Promise((resolve) => {
            var reader = new FileReader();
            let img = new Image();
            img.onload = () => resolve(img);
            reader.onload = () => {
                img.src = reader.result;
            };
            reader.readAsDataURL(this.file);
        })
    }

    readImageBytes(){
        return new Promise((resolve) => {
            var reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(this.file);
        })
    }

    async compute() {
        if (this.isRemote)
            return await this.computeRemote();
        else
           return await this.computeLocal();
    }

    async computeRemote() {
        let fileArrayByffer = await this.readImageBytes();
        let response = await fetch(this.service.url,
            {
                method: "POST",
                body: fileArrayByffer,
                headers: {
                    'Ocp-Apim-Subscription-Key': this.service.secret,
                    'Content-Type': 'application/octet-stream',
                },
                //mode: "no-cors"
            })
        let json = await response.json();
        return await this.processRemoteResults(json);
    }

    async computeLocal() {
        //USe cors-anywehre for local proxy (to avoid CORS)
        var formData = new FormData();
        formData.append("form", this.file);
        
        let response = await fetch(this.service.url,
            {
                method: "POST",
                body: formData,
                headers: {
                    'accept': 'application/json'
                }
            });
        let json = await response.json();
        return await this.processLocalResults(json);
    }

    async processLocalResults(json) {
        let img = await this.loadImageAsync();
        let allWords = [];
        // Set canvas width/height
        let ctx = this.visualResultsCanvas.getContext("2d");
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        // Draw image
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);

        // The local verson deos not return, for each box, x, y, width and height - but x,y for each corners, clockwise

        json.lines.forEach(line => {
            line.words.forEach(word => {
                let x = word.boundingBox[0];
                let y = word.boundingBox[1];
                let width = word.boundingBox[2] - word.boundingBox[0];
                let height = word.boundingBox[7] - word.boundingBox[1];
                ctx.rect(x, y, width, height);
                ctx.stroke();
                allWords.push(
                    {
                        text: word.text,
                        x: x, 
                        y: y, 
                        w: width, 
                        h: height
                    }
                );
            });
        });
        // Write raw json in textarea
        this.rawResultsCanvas.value = JSON.stringify(json, null, 2);
        return allWords;
    }

    async processRemoteResults(json) {
        let img = await this.loadImageAsync();
        let allWords = [];
        // Set canvas width/height
        let ctx = this.visualResultsCanvas.getContext("2d");
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        // Draw image
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);

        json.regions.forEach(region => {
            region.lines.forEach(line => {
                line.words.forEach(word => {
                    let coordinates = word.boundingBox.split(",");
                    ctx.rect(coordinates[0], coordinates[1], coordinates[2], coordinates[3]);
                    ctx.stroke();
                    allWords.push(
                        {
                            text: word.text,
                            x: coordinates[0]*1, 
                            y: coordinates[1]*1, 
                            w: coordinates[2]*1, 
                            h: coordinates[3]*1
                        }
                    );
                });
            });
        });
        // Write raw json in textarea
        this.rawResultsCanvas.value = JSON.stringify(json, null, 2);
        return allWords;
    }
}

export default ocr;