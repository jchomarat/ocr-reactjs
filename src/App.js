import React, { Component } from 'react';
import { Loader } from 'react-overlay-loader';
import logo from './logo.svg';
import './App.css';
import ocr from './ocr';

var wordsInDocument = null;

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      picture: null,
      action: null,
      apiResult: "",
      proxyUrl: ""
    }
  }

  setPicture = e => {
    this.setState({ picture: e.target.files[0] })
  }

  setAction =e => {
    if (e.target.value === "local") {
      this.setState({ action: e.target.value, proxyUrl:`Proxy url: ${process.env.REACT_APP_LOCAL_CORS_PROXY}` })
    }
    else {
      this.setState({ action: e.target.value, proxyUrl: "" })
    }
  }

  compute = e => {
    this.setState({loading: true}, () => {
      let o = new ocr(
          this.state.action, 
          this.state.picture,  
          document.getElementById("raw-output"), 
          document.getElementById("visual-output"));
      
      o.createJob()
        .then((jobUrl) => {
          o.checkJob(jobUrl)
              .then((json) => {
                o.completeJob(json)
                    .then((words) => {
                      wordsInDocument = words;
                      this.setState({loading: false});
                    });
              });
        })
    });
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
    location.reload();
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
                <option value="remote">OCR Azure</option>
                <option value="local">OCR Local</option>
              </select>
              <span className="local-proxy" id="local-proxy">{this.state.proxyUrl}</span>
            </label>
            <br /><br />
            <input type="button" value="Compute!" onClick={this.compute}  />&nbsp;
            <input type="button" value="Clear" onClick={this.clear}  />
          </fieldset>
          <br />
          <fieldset className="results-wrapper">
            <legend>Raw results</legend>
            <textarea id="raw-output" readOnly={true}></textarea>
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
