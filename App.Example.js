/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
 // generated with rn-nodeify
import './shim.js'

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  AsyncStorage
} from 'react-native';

// import project-specific dependencies
import crypto from 'crypto';
import bip39 from 'react-native-bip39';
import * as lightwallet from 'eth-lightwallet';
import * as util from 'ethereumjs-util';

// this will hold the wallet object, which is the only thing that needs to persist in app storage
var keystore

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {mnemonic: '', message: ''};
  }

  // note: i'm using the arrow syntax to preserve the calling environemnt so that 'this' works correctly

  generateWallet = () => {
  // this *must* be done asynchronously to correctly use native android/ios random byte generation
    bip39.generateMnemonic()
      .then(seedPhrase => {
        // the 12 letter phrase
        this.setState({mnemonic: seedPhrase});
        // for now I think this will be the same for all users
        var defaultPassword = "hydroPassword";
        var password = defaultPassword
        // make the keystore, again asynchronously
        lightwallet.keystore.createVault({
          password: password,
          seedPhrase: seedPhrase,
          hdPathString: "m/44'/60'/0'/0"
        }, (err, ks) => {
          if (err) throw err;
          // Some methods will require providing the `pwDerivedKey`,
          // Allowing you to only decrypt private keys on an as-needed basis.
          // You can generate that value with this convenient method:

          // generate the address that will be used to sign messages
          console.log('ks', ks)
          console.log('ks.serialize()', ks.serialize())
          ks.keyFromPassword(password, (err, pwDerivedKey) => {
            if (err) throw err;
            ks.generateNewAddress(pwDerivedKey, 1)
            keystore = ks;
            console.log('keystore', keystore)
          })
        })
      })
      .catch(e => {
        this.setState({mnemonic: e});
      });
  }

  signMessage = () => {
    // obviously the keystore needs to be created before you call this
    keystore.keyFromPassword(this.state.password, (err, pwDerivedKey) => {
      if (err) throw err;

      var addr = keystore.getAddresses()[0];

      var msg = this.state.message;
      var msgHash = util.addHexPrefix(util.sha3(msg).toString('hex'));

      var signedMsg = lightwallet.signing.signMsgHash(keystore, pwDerivedKey, msgHash, addr);
      var concatSig = lightwallet.signing.concatSig(signedMsg).substr(2);

      console.log("ADDRESS: ", addr)
      console.log("HASH:", msgHash)
      console.log("r:", '0x' + concatSig.substr(0, 64));
      console.log("s:", '0x' + concatSig.substr(64, 64));
      console.log("v:", parseInt('0x' + concatSig.substr(128, 2)));
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={this.generateWallet}
          title="Generate Wallet"
          accessibilityLabel="Click to generate mnemonic"
        />
        <Text style={styles.instructions}>
          Mnemonic: {this.state.mnemonic}
        </Text>
        <TextInput
          style={{height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
          placeholder="Message to Sign"
          onChangeText={(message) => this.setState({message: message})}
          value={this.state.text}
        />
        <Button
          onPress={this.signMessage}
          title="Sign Message"
          accessibilityLabel="Click to sign message"
        />
        <Text
          style={styles.instructions}
          selectable={true}>
          {this.state.signatureStatus}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
