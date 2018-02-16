# Sample APP demonstrating integration of BlinkID / CryptoJS in a cordova Project


## Screenshot

<img src="https://user-images.githubusercontent.com/19813688/36318973-bcd1ecdc-1341-11e8-968f-0dff480c8afa.jpg" width="200" alt="Screenshot">

## What's in the box

This sample app is based on Framework7 cordova vue js template (cordova-template-framework7-vue-webpack)
https://github.com/caiobiodere/cordova-template-framework7-vue-webpack

It includes BlinkId for document Scanning :
https://github.com/BlinkID

It also uses the following plugins :
* cordova-plugin-screen-orientation to lock the orientaiton of the screen https://github.com/apache/cordova-plugin-screen-orientation 

* cordova-plugin-secure-key-store to store RSA keys and tokens 
https://github.com/pradeep1991singh/cordova-plugin-secure-key-store

* cordova-plugin-file for local storage of captured images
https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/


For encryption purpose, it uses cryptoJs Package (https://github.com/brix/crypto-js) and jsrsasign (https://github.com/kjur/jsrsasigncryptojs
)

Finally, it uses DropBox SDK JS for storage of images in Dropbox :
https://github.com/dropbox/dropbox-sdk-js

The integration of this sdk is based on the following tutorial : http://codingfix.com/save-database-to-dropbox-account-within-cordova-application-3/ 

Please note that, as of today, this sdk doesn't work when downloading from dropbox in browser environement. 
I made a fork  (https://github.com/nicoduj/dropbox-sdk-js ) and a pull request ( https://github.com/dropbox/dropbox-sdk-js/pull/173 ) with a fix proposal discussed with them. 
Currently, I made a workaround (see main.vue) using temp link and cordova-plugin-file-transfer.

## How to run this sample app

1. Install [Cordova](https://cordova.apache.org), fetch this repository and navigate to the project directory.
2. Then, you need to prepare BlinkID plugin. To do that, follow the steps taht are on their github (https://github.com/BlinkID/blinkid-phonegap) :
    * Clone or Download the repository
    * Don't forget to install git-lfs !
    * Initialize the iOS framework:

      ```
      cd BlinkID
      ./initIOSFramework.sh
      cd ..
      ```
    * Add the BlinkID plugin to your project:

      ```
      cd <path_to_your_project>
      cordova plugin add <blinkID_plugin_path>
      ```
    * You can then add your platform, for example :

      ```
      cordova platform add ios
      ```
3. Finally, you have to create a file named "keys.json" in the src folder, and fill it with your keys.
```json
{
    "BLINK_ID_IOS_LICENSE" : "YOUR_BLINK_ID_KEY_FOR_IOS",
    "BLINK_ID_ANDROID_LICENSE"  : "YOUR_BLINK_ID_KEY_FOR_ANDROID",
    "DROPBOX_CLIENT_ID" : "YOUR_DROPBOX_CLIENT_ID"
 }
```



