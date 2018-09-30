# DappFrontEngine

DappFrontEngine is a declarative style library for easily connecting Ethereum smart contracts to html.

No more need to bother with asynchronous functions and control loops! Simply specify in a configuration file what data should be displayed on which html elements and how it should be formatted, and which buttons send which transactions.

DappFrontEngine also has built-in functions to effortlessly plug in common features like referral code handling, warning the user to use the correct network and be connected to Metamask etc, and links to your contract on Etherscan.

## Usage:

1. Add dappinterpreter.js and interfaceDefinitionBlank.js to your project

2. Add to your html header:

```
<script src="interfaceDefinition.js"></script>
<script src="dappinterpreter.js"></script>
```

3. Add at the end of your html body:

```
<script>
  interpreter.main()
</script>
```
4. Make sure the html elements you want to connect have ids

5. Fill in interfaceDefinitionBlank.js with application logic for your project (check out examples and comments in interfaceDefinitionBasic.js and interfaceDefinition.js for more details on specifics)
   - Contract address
   - Contract ABI
   - Your element ids, what to display in them and what actions they trigger

## [Demo](http://dappfrontenginedemo.surge.sh/)
