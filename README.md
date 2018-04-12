React Native `eth-lightwallet` Demo
-----------------------------------

Creating an Ethereum wallet on mobile devices using `eth-lightwallet` and saving the keystore locally on the device.

### Quick Start

##### Prerequisites

Node package manager.

```
npm install -g react-native-cli
npm install -g rn-nodeify
npm install -g react-devtools
```
...and iOS and Android simulators already configured.

##### Setup

```
git clone git@github.com:ReyHaynes/react-native-eth-lightwallet-demo.git
cd react-native-eth-lightwallet-demo
npm install
react-native link
```

##### Running

Platform: **iOS**

```
react-native run-ios
```

<u>Note</u>: First time running on iOS *might* require you to set the Signature Certificate under *General > Signing* for Target *[AppName]* and *[AppName]Test*.

Platform: **Android**

```
react-native run-android
```
