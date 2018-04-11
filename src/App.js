import './../shim.js'
import React, { Component } from 'react'
import { Platform, StyleSheet, Text, View, Button, TextInput, AsyncStorage } from 'react-native'
import crypto from 'crypto'
import bip39 from 'react-native-bip39'
import Mnemonic from 'bitcore-mnemonic'
import * as lightwallet from 'eth-lightwallet'
import * as util from 'ethereumjs-util'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      password: "Simple Secret Wallet Unlock Password Which Needs To Be Stored Here",
      error: null,
      keystore: false,
      mnemonic: null,
      address: '',
      generating: false,
      restoring: false,
      restoreMnemonic: ''
    }

    this.keystore = null
  }

  componentWillMount() {
    this._loadKeystore()
  }

  _saveKeystore = async () => {
    try {
      await AsyncStorage.setItem('WalletKeystore', this.keystore.serialize())
      this._loadKeystore()
      this.setState({ keystore: true })
    } catch (error) {
      // Error saving data
      this.setState({ error })
    }
  }

  _loadKeystore = async () => {
    try {
      const keystore = await AsyncStorage.getItem('WalletKeystore')
      if (!keystore) return

      const ks = await lightwallet.keystore.deserialize(keystore)
      if (keystore) this.setState({
        keystore: true,
        generating: false,
        address: ks.addresses[0]
      })

      this.keystore = ks
    } catch (error) {
      // Error loading data
      this.setState({ error })
    }
  }

  _deleteKeystore = async () => {
    try {
      await AsyncStorage.removeItem('WalletKeystore')
      this.keystore = null
      this.setState({ keystore: false })
    } catch (error) {
      // Error saving data
      this.setState({ error })
    }
  }

  _generateNewWallet = () => {
    this.setState({ generating: true })

    bip39.generateMnemonic()
      .then(mnemonic => {
        this.setState({ mnemonic })
        this._generateWallet(mnemonic)
      })
      .catch(error => {
        this.setState({ error })
      })
  }

  _generateFromMnemonic = () => {
    const { restoreMnemonic } = this.state

    this.setState({
      generating: true,
      restoring: false,
      restoreMnemonic: ''
    })

    if (restoreMnemonic.split(' ').length != 12 || !Mnemonic.isValid(restoreMnemonic)) {
      this.setState({ generating: false })
      return
    }

    this._generateWallet(restoreMnemonic)
  }

  _generateWallet = (seedPhrase, hdPathString = "m/44'/60'/0'/0") => {
    const { password } = this.state

    lightwallet.keystore.createVault({
      password,
      seedPhrase,
      hdPathString
    }, (error, ks) => {
      if (error) {
        this.setState({ error })
        return
      }

      ks.keyFromPassword(password, (error, pwDerivedKey) => {
        if (error) {
          this.setState({ error })
          return
        }
        ks.generateNewAddress(pwDerivedKey, 1)
        this.keystore = ks
        this._saveKeystore()
      })
    })
  }

  _stateRestore = () => {
    this.setState({ restoring: true })
  }

  render() {
    return (
      <View style={styles.container}>
        { !this.state.keystore ?
          <View>
            { !this.state.generating ?
              <View>
                { !this.state.restoring ?
                  <View>
                    <View style={styles.generateButton}>
                      <Button
                        onPress={this._generateNewWallet}
                        title="Generate New Wallet"
                        accessibilityLabel="Click to generate wallet"
                      />
                    </View>
                    <Button
                      onPress={this._stateRestore}
                      title="Restore Existing Wallet"
                      accessibilityLabel="Click to restore wallet from nmemonic"
                    />
                  </View>
                  :
                  <View>
                    <TextInput
                      style={{height: 40, width: 300, color: 'white', borderColor: 'white', borderBottomWidth: 1}}
                      autoFocus={true}
                      onChangeText={(restoreMnemonic) => this.setState({ restoreMnemonic })}
                      onSubmitEditing={this._generateFromMnemonic}
                      value={this.state.restoreMnemonic}
                    />
                  </View>
                }
              </View>
              :
              <Text style={styles.text}>
                Generating wallet...
              </Text>
            }
          </View>
          :
          <View>
            <Text style={[styles.text, {textAlign: 'center'}]}>
              Keystore loaded...
            </Text>
            <Text style={[styles.text, {fontSize: 14, marginBottom: 20}]}>
                Address: {'\n'}
                {this.state.address}
            </Text>
            { this.state.mnemonic ?
              <View>
                <Text style={[styles.text, {fontSize: 12, marginBottom: 10, fontWeight: 'bold'}]}>
                    Safely copy and paste or screenshot mnemonic below:
                </Text>
                <Text selectable={true} style={[styles.text, {fontSize: 14}]}>
                    {this.state.mnemonic}
                </Text>
              </View>
              : null
            }
            <Button
              onPress={this._deleteKeystore}
              title="Delete Wallet"
              accessibilityLabel="Click to delete wallet"
            />
          </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#03256C',
    paddingLeft: 15,
    paddingRight: 15
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    marginBottom: 25
  },
  generateButton: {
    marginBottom: 25
  },
  restoreTextInput: {
    height: 40,
    width: 300,
    fontSize: 17,
    color: '#FFFFFF',
    borderColor: '#FFFFFF',
    borderBottomWidth: 1
  }
})
