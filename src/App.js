import React, { Component } from 'react';
import { Loader } from 'react-overlay-loader';
import logo from './logo.svg';
import './App.css';

const actionsList = {
  ocr: {
    url: process.env.REACT_APP_BASE_OCR_URL,
    secret: process.env.REACT_APP_BASE_OCR_SECRET
  }
};

var wordsInDocument = null;

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      picture: null,
      action: null,
      apiResult: ""
    }
  }

  setPicture = e => {
    this.setState({ picture: e.target.files[0] })
  }

  setAction =e => {
    this.setState({ action: e.target.value })
  }

  compute = e => {
    this.setState({loading: true}, () => {
      var reader = new FileReader();
      reader.onload = () => {
        var action = actionsList[this.state.action];
        fetch(action.url,
          {
              method: "POST",
              body: reader.result,
              headers: {
                  'Ocp-Apim-Subscription-Key': action.secret,
                  'Content-Type': 'application/octet-stream',
              }
          })
          .then (response => response.json())
          .then (data => {
            this.processResults(data);
          })
      };
      reader.readAsArrayBuffer(this.state.picture);
    });
  }

  processResults(output) {
    var ctx = document.getElementById("visual-output").getContext("2d");
    var reader = new FileReader();
    var img = new Image();
    wordsInDocument = [];
    img.onload = () => {
        // scale canvas to image
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        // draw image
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
        // draw boxes => look for all "word" properties
        output.regions.forEach(region => {
          region.lines.forEach(line => {
            line.words.forEach(word => {
              let coordinates = word.boundingBox.split(",");
              ctx.rect(coordinates[0], coordinates[1], coordinates[2], coordinates[3]);
              ctx.stroke();
              wordsInDocument.push({
                text: word.text,
                x: coordinates[0]*1, 
                y: coordinates[1]*1, 
                w: coordinates[2]*1, 
                h: coordinates[3]*1
              });
            });
          });
        });

        // End process
        this.setState({loading: false, apiResult: JSON.stringify(output, null, 2)});
    }
    reader.onload = () => {
      img.src = reader.result;
    };
    reader.readAsDataURL(this.state.picture);
  }

  canvasClick = e => {
    let canvas = document.getElementById("visual-output");
    const rect = canvas.getBoundingClientRect();
    let coordinates = {
      y: e.clientY - rect.top,
      x: e.clientX - rect.left
    }

    wordsInDocument.forEach(item => {
      if (coordinates.x > item.x && coordinates.x < item.x + item.w && coordinates.y > item.y && coordinates.y < item.y + item.h) {
        var tooltipSpan = document.getElementById('tooltip-span');
        tooltipSpan.innerText = item.text;
        tooltipSpan.style.top = (e.clientY + 5) + 'px';
        tooltipSpan.style.left = (e.clientX + 5) + 'px';
        tooltipSpan.style.display = "block";
        return;
      }
    });
  }

  canvasMoveOut = e => {
    var tooltipSpan = document.getElementById('tooltip-span');
    tooltipSpan.innerText = "";
    tooltipSpan.style.display = "none";
  }

  clear = e => {
    this.setState({loading: false, apiResult: "", picture: null, action: null}, () => {
      let canvas = document.getElementById("visual-output");
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById("select-action").selectedIndex = 0;
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <div className="App-intro">
          <fieldset className="form-wrapper">
            <legend>What do you want to compute?</legend>
            <label>
              Upload a picture:
              <input type="file" onChange={this.setPicture}/>
            </label>
            <br /><br />
            <label>
              Type of computation:
              <select onChange={this.setAction} id="select-action">
                <option>Select action</option>
                <option value="ocr">OCR</option>
              </select>
            </label>
            <br /><br />
            <input type="button" value="Compute!" onClick={this.compute}  />&nbsp;
            <input type="button" value="Clear" onClick={this.clear}  />
          </fieldset>
          <br />
          <fieldset className="results-wrapper">
            <legend>Raw results</legend>
            <textarea value={this.state.apiResult} readOnly={true}></textarea>
          </fieldset>
          <br />
          <fieldset className="results-wrapper">
            <legend>Visual results</legend>
            <div className="tooltip">
              <canvas id="visual-output" onClick={this.canvasClick} onMouseOut={this.canvasMoveOut}></canvas>
              <span id="tooltip-span"></span>
            </div>
          </fieldset>
        </div>
        <Loader fullPage loading={this.state.loading} containerStyle={{background: "rgba(255, 255, 255, 0.9)"}}/>
      </div>
    );
  }
}

export default App;
