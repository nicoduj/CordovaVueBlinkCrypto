var r = require('jsrsasign')
var cryptojs = require('crypto-js')
// var mom = require('moment')

const DEFAULT_SIGNATURE_ALGO = 'SHA512withRSA'

class CryptoService {

  signPayload (privatePEM, payload) {
    try {
      let jsonString = JSON.stringify(payload)
      let signb64 = this.sign(privatePEM, jsonString)

      return signb64
    } catch (err) {
      console.log('Failed to sign payload')
      return null
    }
  }

  sign (privatePEM, data) {
    try {
      let privateKey = r.KEYUTIL.getKey(privatePEM)

      let sigPriv = new r.Signature({
        'alg': DEFAULT_SIGNATURE_ALGO
      })
      sigPriv.init(privateKey)
      sigPriv.updateString(data)
      let signb64 = r.hex2b64(sigPriv.sign())

      return signb64
    } catch (err) {
      console.log('Failed to sign data')
      return null
    }
  }

  validateCertificate (pemCertificate, rootCertificate, expectedCollectorId) {
    var collectorCertificate = new r.X509()
    collectorCertificate.readCertPEM(pemCertificate)
    var caCert = new r.X509()
    caCert.readCertPEM(rootCertificate)
    // if (mom().diff(mom(collectorCertificate.getNotAfter(), 'YYMMDDhhmmssZ')) > 0) {
    //   return false
    // }
    // if (mom().diff(mom(collectorCertificate.getNotBefore(), 'YYMMDDhhmmssZ')) < 0) {
    //   return false
    // }
    if (expectedCollectorId) {
      if (collectorCertificate.getSubjectString().indexOf(expectedCollectorId) === -1) {
        return false
      }
    } else {
      console.log('Certificate Subject: ' + collectorCertificate.getSubjectString())
    }

    try {
      var hTbsCert = r.ASN1HEX.getTLVbyList(collectorCertificate.hex, 0, [0], '30')
      var alg = collectorCertificate.getSignatureAlgorithmField()
      var signature = collectorCertificate.getSignatureValueHex() // r.ASN1HEX.getVbyList(collectorCertificate.hex, 0, [2], '03', true)
      var sig = new r.crypto.Signature({alg: alg})
      sig.init(rootCertificate)
      sig.updateHex(hTbsCert)
      console.log('verifying cert')
      var res = sig.verify(signature)
      console.log('verification:' + res)
    } catch (ee) {
      console.log('error:' + ee)
      return false
    }
    console.log('Certificate validation done')
    return res
  }

  verifSign (publicPEM, data, signature) {
    try {
      let publicKey = r.KEYUTIL.getKey(publicPEM)

      var sigPub = new r.Signature({
        'alg': DEFAULT_SIGNATURE_ALGO
      })
      sigPub.init(publicKey)
      sigPub.updateString(data)
      var result = sigPub.verify(r.b64tohex(signature))

      return result
    } catch (err) {
      console.log('Failed to sign data')
      return false
    }
  }

  generateAESKey () {
    var salt = cryptojs.lib.WordArray.random(16)
    var res = cryptojs.PBKDF2('password', salt, { keySize: 128 / 32 })
    console.log('AESPBKDF2: ' + res.toString())
    return res
  }

  parseAESKey (serializedKey) {
    return cryptojs.enc.Hex.parse(serializedKey)
  }

  encryptAES (aeskey, data) {
    var encrypted = cryptojs.AES.encrypt(data, aeskey, {iv: cryptojs.enc.Hex.parse('00000000000000000000000000000000'), padding: cryptojs.pad.Pkcs7})
    console.log('encrypted')
    return encrypted
  }

  decryptAES (aeskey, data) {
    console.log('about to decrypt: ' + data)
    var decrypted = cryptojs.AES.decrypt(data, aeskey, {iv: cryptojs.enc.Hex.parse('00000000000000000000000000000000'), padding: cryptojs.pad.Pkcs7})
    return decrypted.toString(cryptojs.enc.Utf8)
  }

  encrypt (publicPEM, data) {
    let vv = data
    if (typeof (data) !== 'string') {
      console.log('not a string')
      vv = cryptojs.enc.Base64.stringify(data)
    }
    try {
      let CY = r.crypto.Cipher
      let publicKey = r.KEYUTIL.getKey(publicPEM)
      let encryptedData = CY.encrypt(vv, publicKey)
      console.log('encryptedData:' + encryptedData)
      return cryptojs.enc.Base64.stringify(cryptojs.enc.Hex.parse(encryptedData))
    } catch (err) {
      console.log('Failed to encrypt data')
      return null
    }
  }

  decrypt (privatePEM, encryptData) {
    try {
      let encryptedObject = cryptojs.enc.Hex.stringify(cryptojs.enc.Base64.parse(encryptData))
      let privateKey = r.KEYUTIL.getKey(privatePEM)
      let CY = r.crypto.Cipher
      let decryptedData = CY.decrypt(encryptedObject, privateKey)

      return decryptedData
    } catch (err) {
      console.log('Failed to decrypt data')
      return null
    }
  }
}

export let crypto = new CryptoService()

