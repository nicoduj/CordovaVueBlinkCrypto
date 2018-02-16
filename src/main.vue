<template>
	<!-- App -->
	<div id="app">
		
		<!-- Statusbar -->
		<f7-statusbar></f7-statusbar>
		
		<!-- Main Views -->
		<f7-views>
			<f7-view id="main-view" navbar-through :dynamic-navbar="true" main>

      <f7-navbar>
            <f7-nav-left>
                <!-- <f7-link class="panel-open" open-panel="left" icon="fa fa-bars"></f7-link> -->
            </f7-nav-left>
            <div class="title">Framework7-Vue Sample App</div>
            <f7-nav-right>
                <!-- <f7-link class="searchbar-enable" data-searchbar=".searchbar-components" icon="fa fa-search"></f7-link> -->
            </f7-nav-right>


        </f7-navbar>

        
				<f7-pages>


					<f7-page>
						<f7-block-title>Welcome to this sample App</f7-block-title>
						<f7-block inner>
							<p>Demonstration app combining Blinkid / Local Storage / DropBox / CryptoJS / SecureKeyStore </p>
						</f7-block>

		<f7-block inner>
			<p>
        <f7-buttons color="blue">
				<f7-button round big id="scanButton">Scan ID Card</f7-button>
        <f7-button round big id="cleanButton">Clear</f7-button>
        </f7-buttons>
			</p>
	  </f7-block>

    <f7-block inner>

			<p>
				<f7-buttons color="red">
					<f7-button round big id="saveButtonLoc" >Save to local</f7-button>
					<f7-button round big id="saveButton" >Save to dropBox</f7-button>
				</f7-buttons>
			</p>
	  </f7-block>

        <f7-block inner>

			<p>
				<f7-buttons color="green">
					<f7-button round big id="loadButtonLoc" >Load from local</f7-button>
					<f7-button round big id="loadButton" >Load from dropbox</f7-button>
				</f7-buttons>
			</p>
	  </f7-block>

    <f7-block inner>
			<p>
       <f7-toolbar >
        <f7-link text="ID Image" tab-link="#documentImageDiv" active ></f7-link>
        <f7-link text="Data" tab-link="#resultDiv"></f7-link>
        <f7-link text="Full Image" tab-link="#successfulImageDiv"></f7-link>
        <f7-link text="Face" tab-link="#faceImageDiv"></f7-link>
    </f7-toolbar>
    
        <f7-tabs animated >

            <f7-tab id="documentImageDiv" tab-active >
                <img id="documentImage" width="80%" />
            </f7-tab>

            <f7-tab id="resultDiv">
              <p>No data</p>
            </f7-tab>

            <f7-tab id="successfulImageDiv">
                <img id="successfulImage" width="80%" />
            </f7-tab>

            <f7-tab id="faceImageDiv" >
                <img id="faceImage" width="60%" />
            </f7-tab>

        </f7-tabs> 

			</p>

	  </f7-block>

					</f7-page>
				</f7-pages>
			</f7-view>
		</f7-views>

	
	</div>
</template>



<script>
import { crypto } from "./assets/js/cryptoService";
import keys from  "./keys.json";


export default {
  data: () => ({
    base64IMG: null,
    clearAESkey: null
  }),
  mounted() {
    var loadButtonLoc = document.getElementById("loadButtonLoc");
    var saveButtonLoc = document.getElementById("saveButtonLoc");
    var loadButton = document.getElementById("loadButton");
    var saveButton = document.getElementById("saveButton");
    var cleanButton = document.getElementById("cleanButton");

    var resultDiv = document.getElementById("resultDiv");
    var successfulImageDiv = document.getElementById("successfulImageDiv");
    var successfulImage = document.getElementById("successfulImage");
    var documentImageDiv = document.getElementById("documentImageDiv");
    var documentImage = document.getElementById("documentImage");
    var faceImageDiv = document.getElementById("faceImageDiv");
    var faceImage = document.getElementById("faceImage");

    //var base64IMG;
    /**
     * Use these scanner types
     * Available: "PDF417", "USDL", "Barcode", "MRTD", "EUDL", "UKDL", "DEDL", "MyKad", "GermanOldID", "GermanIDFront", "GermanIDBack", "GermanPassport", "DocumentFace", "DocumentDetector"
     * PDF417 - scans PDF417 barcodes
     * USDL - scans barcodes located on the back of US driver's license
     * Barcode - scans various types of codes (i.e. QR, UPCA, UPCE...). Types of scanned codes can be modified in plugin classes (Explained later in this readme). By default, scanned codes are set to: Code 39, Code 128, EAN 13, EAN 8, QR, UPCA, UPCE
     * MRTD - scans Machine Readable Travel Document, contained in various IDs and passports
     * EUDL - scans the front of European driver's license
     * UKDL - scans the front of United Kingom driver's license
     * DEDL - scans the front of German driver's license
     * MyKad - scans the front of Malaysian ID cards
     * GermanOldID - scans the front of old German ID cards
     * GermanIDFront - scans the front of German ID cards
     * GermanIDBack - scans the back of German ID cards
     * GermanPassport - scans the front of German passports
     * DocumentFace - scans documents which contain owner's face image
     * DocumentDetector - scans documents that are specified as ID1 or ID2 and returns their image
     *
     * Variable << types >> declared below has to contain all the scanners needed by your application. Applying additional scanners will slow down the scanning process
     */
    var types = ["MRTD"];

    /**
     * Image type defines type of the image that will be returned in scan result (image is returned as Base64 encoded JPEG)
     * available:
     *  empty - do not return any images - IMPORTANT : THIS IMPROVES SCANNING SPEED!
     *  "IMAGE_SUCCESSFUL_SCAN" : return full camera frame of successful scan
     *  "IMAGE_DOCUMENT" : return cropped document image
     *  "IMAGE_FACE" : return image of the face from the ID
     */
    var imageTypes = ["IMAGE_SUCCESSFUL_SCAN", "IMAGE_FACE", "IMAGE_DOCUMENT"];

    /**
     * Language to be used in the scanning UI
     * Available:
     *  - English: "en"
     *  - Croatian: "hr"
     */
    var language = "en";

    // Note that each platform requires its own license key

    // This license key allows setting overlay views for this application ID: com.microblink.blinkid
    var licenseiOs =  keys.BLINK_ID_IOS_LICENSE;

    // This license is only valid for package name "com.microblink.blinkid"
	var licenseAndroid = keys.BLINK_ID_ANDROID_LICENSE;

    //require("isomorphic-fetch");
    var dropboxCLIENT_ID = keys.DROPBOX_CLIENT_ID;

    var Dropbox = require("dropbox").Dropbox;
    var dbxt;
    var dbx = new Dropbox({
      clientId: dropboxCLIENT_ID
    });
    var that = this;

    that.clean();

    document.addEventListener("deviceready", function() {
		screen.orientation.lock('portrait');
      that.setAESKey();
    });

    cleanButton.addEventListener("click", function() {
      that.clean();
    });

    loadButtonLoc.addEventListener("click", function() {
      that.loadImages(false, null);
    });

    saveButtonLoc.addEventListener("click", function() {
      var encryptedValue = crypto
        .encryptAES(that.clearAESkey, that.base64IMG)
        .toString();

      that.exportImages(false, encryptedValue);
    });

    loadButton.addEventListener("click", function() {
      if (dbxt == null) {
        var dropboxToken;

        cordova.plugins.SecureKeyStore.get(
          function(res) {
            dropboxToken = res;
            dbxt = new Dropbox({ accessToken: dropboxToken });
            that.loadImages(true, dbxt);
          },
          function(error) {
            console.log(error);

            dbx.authenticateWithCordova(function(accessToken) {
              cordova.plugins.SecureKeyStore.set(
                function(res) {
                  console.log(res); // res - string securely stored
                },
                function(error) {
                  console.log(error);
                },
                "CordovaVueBlinkCrypto_dropboxToken",
                accessToken
              );

              dbxt = new Dropbox({ accessToken: accessToken });
              that.loadImages(true, dbxt);
            });
          },
          "CordovaVueBlinkCrypto_dropboxToken"
        );
      } else {
        that.loadImages(true, dbxt);
      }
    });

    saveButton.addEventListener("click", function() {
      var encryptedValue = crypto
        .encryptAES(that.clearAESkey, that.base64IMG)
        .toString();

      if (dbxt == null) {
        var dropboxToken;

        cordova.plugins.SecureKeyStore.get(
          function(res) {
            dropboxToken = res;
            dbxt = new Dropbox({ accessToken: dropboxToken });
            that.exportImages(true, encryptedValue, dbxt);
          },
          function(error) {
            console.log(error);

            dbx.authenticateWithCordova(function(accessToken) {
              cordova.plugins.SecureKeyStore.set(
                function(res) {
                  console.log(res); // res - string securely stored
                },
                function(error) {
                  console.log(error);
                },
                "CordovaVueBlinkCrypto_dropboxToken",
                accessToken
              );

              dbxt = new Dropbox({ accessToken: accessToken });
              that.exportImages(true, encryptedValue, dbxt);
            });
          },
          "CordovaVueBlinkCrypto_dropboxToken"
        );
      } else {
        that.exportImages(true, encryptedValue, dbxt);
      }
    });

    scanButton.addEventListener("click", function() {
      var kPPmrtdBirthDate = "DateOfBirth";
      var kPPmrtdExpiry = "DateOfExpiry";
      var kPPmrtdDocCode = "DocumentCode";
      var kPPmrtdDocNumber = "DocumentNumber";
      var kPPmrtdIssuer = "Issuer";
      var kPPmrtdRaw = "Raw";
      var kPPmrtdNationality = "Nationality";
      var kPPmrtdOpt1 = "Opt1";
      var kPPmrtdOpt2 = "Opt2";
      var kPPmrtdDataType = "PaymentDataType";
      var kPPmrtdPrimaryId = "PrimaryId";
      var kPPmrtdSecondaryId = "SecondaryId";
      var kPPmrtdSex = "Sex";

      that.clean();

      cordova.plugins.blinkIdScanner.scan(
        // Register the callback handler
        function callback(scanningResult) {
          // handle cancelled scanning
          if (scanningResult.cancelled == true) {
            resultDiv.innerHTML = "Cancelled!";
            return;
          }

          // Obtain list of recognizer results
          var resultList = scanningResult.resultList;


          // Image is returned as Base64 encoded JPEG
          var image = scanningResult.resultImage;

          // Successful image is returned as Base64 encoded JPEG
          var resultSuccessfulImage = scanningResult.resultSuccessfulImage;
          if (resultSuccessfulImage) {
            successfulImageDiv.style.visibility="visible";
            successfulImage.src =
              "data:image/jpg;base64, " + resultSuccessfulImage;

          }

          // Iterate through all results
          for (var i = 0; i < resultList.length; i++) {
            // Get individual resilt
            var recognizerResult = resultList[i];

            if (recognizerResult.resultType == "MRTD result") {
              var fields = recognizerResult.fields;

              resultDiv.innerHTML /** Personal information */ =
                "Family name: " +
                fields[kPPmrtdPrimaryId] +
                "<br>" +
                "First name: " +
                fields[kPPmrtdSecondaryId] +
                "<br>" +
                "Date of birth: " +
                fields[kPPmrtdBirthDate] +
                "<br>" +
                "Sex: " +
                fields[kPPmrtdSex] +
                "<br>" +
                "Nationality: " +
                fields[kPPmrtdNationality] +
                "<br>" +
                "Date of Expiry: " +
                fields[kPPmrtdExpiry] +
                "<br>" +
                "Document Code: " +
                fields[kPPmrtdDocCode] +
                "<br>" +
                "Document Number: " +
                fields[kPPmrtdDocNumber] +
                "<br>" +
                "Issuer: " +
                fields[kPPmrtdIssuer] +
                "<br>" +
                "ID Type: " +
                fields[kPPmrtdDataType] +
                "<br>" +
                "Opt1: " +
                fields[kPPmrtdOpt1] +
                "<br>" +
                "Opt2: " +
                fields[kPPmrtdOpt2] +
                "<br>";
            } else if (
              recognizerResult.resultType == "DocumentDetector result"
            ) {
              var fields = recognizerResult.fields;

              resultDiv.innerHTML = "Found a document";
            } else if (recognizerResult.resultType == "DocumentFace result") {
              var fields = recognizerResult.fields;

              resultDiv.innerHTML = "Found document with face";
            } else {
              var fields = recognizerResult.fields;

              resultDiv.innerHTML = recognizerResult.resultType;
            }

            // Document image is returned as Base64 encoded JPEG
            var resultDocumentImage = recognizerResult.resultDocumentImage;
            if (resultDocumentImage) {
              documentImageDiv.style.visibility="visible";
              documentImage.src =
                "data:image/jpg;base64, " + resultDocumentImage;
              that.base64IMG = resultDocumentImage;
              
            } 

            // Face image is returned as Base64 encoded JPEG
            var resultFaceImage = recognizerResult.resultFaceImage;
            if (resultFaceImage) {
              faceImageDiv.style.visibility="visible";
              faceImage.src = "data:image/jpg;base64, " + resultFaceImage;
              
            } 
          }
        },

        // Register the error callback
        function errorHandler(err) {
          alert("Error: " + err);
        },

        types,
        imageTypes,
        licenseiOs,
        licenseAndroid,
        language
      );
    });
  },

  methods: {
    setAESKey() {
      var that = this;

      cordova.plugins.SecureKeyStore.get(
        function(res) {
          that.clearAESkey = res;
        },
        function(error) {
          console.log(error);
          that.clearAESkey = crypto.generateAESKey();
          cordova.plugins.SecureKeyStore.set(
            function(res) {
              console.log(res); // res - string securely stored
            },
            function(error) {
              console.log(error);
            },
            "CordovaVueBlinkCrypto_AESKey",
            that.clearAESkey
          );
        },
        "CordovaVueBlinkCrypto_AESKey"
      );
    },

    updateImage(image) {

      var resultDiv = document.getElementById("resultDiv");
      var documentImageDiv = document.getElementById("documentImageDiv");
      var documentImage = document.getElementById("documentImage");
      this.clean();

      if (image) {
        this.base64IMG = image;
        documentImage.src = "data:image/jpg;base64, " + image;
        resultDiv.innerHTML = "Image Restored";
        documentImageDiv.style.visibility="visible";
      } 
    },

    onErrorLoadFile(e) {
      console.log("Error reading file: " + e.toString());
    },

    onErrorLoadFs(e) {
      console.log("Error loading file system: " + e);
    },
    onErrorCreateDir(e) {
      console.log("Error creating directory: " + e);
    },
    onErrorCreateFile(e) {
      console.log("Error creating file: " + e);
    },

    writeFile(fileEntry, dataObj) {
      var that = this;
      // Create a FileWriter object for our FileEntry.
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function() {
          console.log("Successful file write...");
          //that.readFile(fileEntry);
        };
        fileWriter.write(dataObj, "UTF-8");
      }, that.onErrorWriteFile);
    },

    onErrorWriteFile(e) {
      console.log("Error writing file: " + e.toString());
    },

    readFile(fileEntry) {
      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.onloadend = function() {
          console.log(
            "Successful file read: " +
              fileEntry.fullPath +
              " - content: " +
              this.result
          );
          return this.result;
        };
        reader.readAsText(file, "UTF-8");
      }, this.onErrorReadFile);
    },

    onErrorReadFile(e) {
      console.log("Error reading file: " + e);
    },

    loadImages(fromDropbox, dbxt) {
      var that = this;
      if (!fromDropbox) {
        var pathToFile =
          cordova.file.dataDirectory + "/CordovaVueBlinkCryptoFolder/CordovaVueBlinkCrypto.data";
        window.resolveLocalFileSystemURL(
          pathToFile,
          function(fileEntry) {
            fileEntry.file(function(file) {
              var reader = new FileReader();

              reader.onloadend = function(e) {
                alert("data restored successfully!");

                var image = crypto.decryptAES(that.clearAESkey, this.result);

                that.updateImage(image);
              };

              reader.readAsText(file, "UTF-8");
            }, that.onErrorLoadFile);
          },
          that.onErrorLoadFs
        );
      } else {

          //////////////////////////
          //////////////////////////
          // USE THIS CODE IF DROPOX SDK  IS NOT FIXED FOR DOWNLOAD ISSUE ON BROWSERIFY https://github.com/dropbox/dropbox-sdk-js/pull/173/files 
          //////////////////////////
          //////////////////////////

          dbxt.filesGetTemporaryLink({
            path: "/CordovaVueBlinkCrypto.data"
          })

          .then(function(response) {
            var fileTransfer = new FileTransfer();
            var uri = encodeURI(response.link);

            var pathToFile =
              cordova.file.dataDirectory + "/CordovaVueBlinkCryptoFolder/CordovaVueBlinkCrypto.data";

            fileTransfer.download(
              uri,
              pathToFile,
              function(entry) {
                console.log("download complete: " + entry.toURL());

                entry.file(function(file) {
                  var reader = new FileReader();

                  reader.onloadend = function(e) {
                    alert("data restored successfully!");

                    var image = crypto.decryptAES(that.clearAESkey, this.result);

                    that.updateImage(image);
                  };

                  reader.readAsText(file, "UTF-8");
                }, that.onErrorLoadFile);
              },
              function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("download error code" + error.code);
              },
              false,
              {}
            );
            console.log(response.link);
          })
          .catch(function(error) {
            alert("error restoring data from dropbox!");
            console.error(error.message);
          });

          //////////////////////////
          //////////////////////////
          // USE THIS CODE IF DROPOX SDK  IS NOT FIXED FOR DOWNLOAD ISSUE ON BROWSERIFY https://github.com/dropbox/dropbox-sdk-js/pull/173/files 
          //////////////////////////
          //////////////////////////

          // dbxt.filesDownload({
          //   path: "/CordovaVueBlinkCrypto.data"
          // })
          // .then(function(response) {
          //   console.log(response);

          //   var reader = new FileReader();

          //   reader.onloadend = function() {
          //     alert("data restored successfully!");
          //     var image = crypto.decryptAES(that.clearAESkey, this.result);
          //     that.updateImage(image);
          //   };

          //   reader.readAsText(response.fileBlob, "UTF-8");
          // })
          // .catch(function(error) {
          //   alert("error restoring data from dropbox!");
          //   console.error(error.message);
          // });

          //////////////////////////
          //////////////////////////
          // END DROPBOX PB 
          //////////////////////////
          //////////////////////////


      }
    },

    exportImages(toDropbox, esfolder, dbxt) {
      var that = this;
      if (esfolder) {
        window.resolveLocalFileSystemURL(
          cordova.file.dataDirectory,
          function(dirEntry) {
            dirEntry.getDirectory(
              "/CordovaVueBlinkCryptoFolder",
              { create: true },
              function(dirEntry) {
                dirEntry.getFile(
                  "CordovaVueBlinkCrypto.data",
                  { create: true },
                  function(fileEntry) {
                    alert(
                      "Create the local file: " +
                        fileEntry.name +
                        " at location :  " +
                        dirEntry.name
                    );

                    that.writeFile(fileEntry, esfolder);

                    if (toDropbox) {
                      console.log("export: user already authenticated");
                      dbxt
                        .filesUpload({
                          path: "/" + fileEntry.name,
                          contents: esfolder,
                          mode: "overwrite",
                          mute: true
                        })
                        .then(function(response) {
                          alert(
                            "Your data has been successfully uploaded to your Dropbox!"
                          );
                          console.log(response);
                        })
                        .catch(function(error) {
                          alert("Error saving file to your Dropbox!");
                          console.log(error.message);
                        });
                    }
                  }
                );
              },
              that.onErrorCreateFile
            );
          },
          that.onErrorCreateDir
        );
      } else {
        alert("No data to save");
      }
    },

    clean() {
      var resultDiv = document.getElementById("resultDiv");
      var successfulImageDiv = document.getElementById("successfulImageDiv");
      var successfulImage = document.getElementById("successfulImage");
      var documentImageDiv = document.getElementById("documentImageDiv");
      var documentImage = document.getElementById("documentImage");
      var faceImageDiv = document.getElementById("faceImageDiv");
      var faceImage = document.getElementById("faceImage");

      successfulImageDiv.style.visibility="hidden";
      faceImageDiv.style.visibility="hidden";
      documentImageDiv.style.visibility="hidden";

      resultDiv.innerHTML = "No Data";

    }
  }
};
</script>