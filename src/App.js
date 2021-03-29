import React, { Component } from "react";

var SCOPE = "https://www.googleapis.com/auth/drive.file";
var discoveryUrl = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

class App extends Component {
  state = {
    name: "",
    googleAuth: "",
    selectedFile: null,
    fileDateBlob: "",
  };

  onFileChange = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  componentDidMount() {
    var script = document.createElement("script");
    script.onload = this.handleClientLoad;
    script.src = "https://apis.google.com/js/api.js";
    document.body.appendChild(script);
  }

  initClient = () => {
    try {
      window.gapi.client
        .init({
          apiKey: "AIzaSyCbJmoRQ1saIH_GKxIJmpqs4T5tladZjzg",
          clientId:
            "1041270221834-3rssorksjh2ciaiuifill1ph8sscjj19.apps.googleusercontent.com",
          scope: SCOPE,
          discoveryDocs: [discoveryUrl],
        })
        .then(() => {
          this.setState({
            googleAuth: window.gapi.auth2.getAuthInstance(),
          });
          this.state.googleAuth.isSignedIn.listen(this.updateSigninStatus);
          document
            .getElementById("signin-btn")
            .addEventListener("click", this.signInFunction);
          document
            .getElementById("signout-btn")
            .addEventListener("click", this.signOutFunction);
        });
    } catch (e) {
      console.log(e);
    }
  };

  signInFunction = () => {
    this.state.googleAuth.signIn();
    this.updateSigninStatus();
  };

  signOutFunction = () => {
    this.state.googleAuth.signOut();
    this.updateSigninStatus();
  };

  updateSigninStatus = () => {
    this.setSigninStatus();
  };

  setSigninStatus = async () => {
    var user = this.state.googleAuth.currentUser.get();
    console.log("User:", user);
    if (user == null) {
      this.setState({
        name: "",
      });
    } else {
      var isAuthorized = user.hasGrantedScopes(SCOPE);
      if (isAuthorized) {
        this.setState({
          name: user?.Rs?.Te,
        });
        const boundary = "google_file_upload";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        var fileData = this.state.selectedFile;
        var contentType = this.state.selectedFile.type;
        var contentLength = this.state.selectedFile.size;
        var metadata = {
          name: this.state.selectedFile.name,
          mimeType: this.state.selectedFile.type,
        };
        console.log(contentLength);

        let reader = new FileReader();
        reader.readAsDataURL(this.state.selectedFile);
        reader.onload = (e) => {
          var multipartRequestBody =
            delimiter +
            "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
            JSON.stringify(metadata) +
            delimiter +
            "Content-Type: " +
            contentType +
            "\r\n\r\n" +
            e.target.result +
            "\r\n" +
            close_delim;

          var request = window.gapi.client.request({
            path: "https://www.googleapis.com/upload/drive/v3/files",
            method: "POST",
            params: { uploadType: "multipart" },
            headers: {
              "Content-Type": "multipart/related; boundary=" + boundary + "",
              "Content-Length": contentLength,
            },
            body: multipartRequestBody,
          });
          request.execute(function (file) {
            console.log(file);
          });
        };
      }
    }
  };

  handleClientLoad = () => {
    window.gapi.load("client:auth2", this.initClient);
  };
  render() {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="card w-50">
          <div className="card-body">
            <h1 className="card-ttle text-center">Google Drive File Upload</h1>
            <div className="text-center mt-5">
              <label class="btn btn-default mb-0 border px-5 mr-3">
                Select File{" "}
                <input
                  type="file"
                  hidden
                  name="file"
                  onChange={this.onFileChange}
                />
              </label>
              <button id="signin-btn" className="btn btn-primary">
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
