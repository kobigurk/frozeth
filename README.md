## Frozeth

Ethereum tools for the offline machine.

I originally developed this tool following requests from the local community to claim the presale wallets while not being able to install and work with a node (i.e. windows 32 bit or an extremely non-techie).

I then understood an interesting use-case of it can be a cold wallet:
- Create a transaction on the offline machine and save it to a file.
- Load the signed transaction on the online machine, connect to the client and transmit it.

This is **extremely** alpha and should not be used (yet) with ether it would hurt you to lose.

Frozeth uses electron, so the easiest way to run it is :
- npm install -g electron-prebuilt
- electron app

Frozeth also uses js libraries from the ethereum developers and community such as *ethereumjs-tx* and *web3.js*.

To build Frozeth: 
- npm install -g electron-packager
- enter the *builder* directory.
- If you want to update the bitcoin libraries, run ./build_bitcoin_libs.js.
- Inspect the other scripts to see how to use electron-packager.
