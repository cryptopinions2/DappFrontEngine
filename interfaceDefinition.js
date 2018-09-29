/*
  Edit this configuration file to connect your html to a smart contract! All application logic can be specified here.

  Reserved DAppFrontEngine scripting variables and functions (can be used in display,action,disable etc statements):
  userAddress: the current user's Ethereum address (wrapper for web3.eth.accounts[0])
  etherscanLink: web url to the Etherscan page for the contract
  referralLink: referral link for current user
  referralAddress: referral address in url or cookies (saved automatically from url variable). Defaults to 0x0
  weiToDisplay(number): translates value from wei into a formatted Eth value.
  weiToEth(number): translates value from wei to Eth
  ethToWei(number): translates value from Eth to Wei
  toDecimal(number hex): wrapper for web3.toDecimal, converts to a number. Warning: javascript throws away the last digits of very large numbers; do not use this if you need to retain precision with large numbers.
  secondsToString(number): translates number of seconds to a human readable counter

  All element ids are also usable as scripting variables; the id of an input will represent the current value of that input.

  Solidity functions in the contract may be called directly as if they were not asynchronous. You can specify the value sent to a payable function by using the desired Wei value as the first parameter.
*/

var dappInterface={
  /*
    Useful if you have multiple similar elements. Duplicates multiple elementsById entries if a macro is contained in its key.
  */
  "macros":{
    "%i%":[0,1,2,3]
  },
  /*
    These represent elements in your html, referenced by their id attribute.
    Things you can do to an element:

    display: changes either the textContent or value attribute of tprecisionhe element to the value of the expression.

    attributes: changes the specified attributes to the value of the expressions

    disable: if the element is a button or a element, makes it unclickable if the expression evaluates to true. Useful for preventing transaction errors in situations where a transaction cannot be sent.

    action: changes the onclick function of the element to run the expression (can use this to send smart contract transactions).
  */
  "elementsById":{
    /*
      specify ways your html elements are connected to your Ethereum contract. Expressions are evaluated as javascript.
    */
    "myNapkinsDiv":{
      "display":"toDecimal(napkinCount(userAddress))"//calls the smart contract function 'napkinCount', with the current user's ethereum address as a parameter, converts it to a number, and sets the text content of the element with id 'myNapkinsDiv' to that number.
    },
    "getFreeNapkinsButton":{
      "action":"getFreeNapkins()"//when this button is pressed, a transaction calling the contract function 'getFreeNapkins()' is called.
    },
    "napkinCountdownSpan":{
      "display":"secondsToString(countdownTimeLeft())"//calls the contract function 'countdownTimeLeft()', formats it to a countdown string, and sets the text content of element with id 'napkinCountdownSpan' to that string.
    },
    "buyNapkinsButton":{
      "display":"'Buy '+Math.floor(ethToWei(napkinsToBuyInput)/NAPKIN_VALUE())+' Napkins'",//displays a string describing the number of napkins you can buy with the Eth value entered by the user in the field with id 'napkinsToBuyInput'. Uses the NAPKIN_VALUE() contract function for this. Converts the Eth value to Wei for this purpose.
      "action":"buyNapkins(ethToWei(napkinsToBuyInput),referralAddress)",//sets button to call contract function 'buyNapkins'. Sends Eth equal to amount specified by user in field napkinsToBuyInput. If there is a referral address in the url or cookies, buys with that referral address.
    },
     "contractLink":{
       "attributes":{
         "href":"etherscanLink"//sets the href attribute of element with id 'contractLink' to the url of the Etherscan page for this contract.
       }
     },
     "contractBalanceSpan":{
       "display":"weiToDisplay(balance())"//sets contractBalanceSpan element text content to a human readable (dynamically truncated) formatted Eth string.
     },
     "sellNapkinsButton":{
       "action":"sellNapkins(napkinsToSellInput)",//when this button is pressed, a transaction calling the contract function 'sellNapkins' is called, using the value in the field 'napkinsToSellInput' as a parameter.
       "disable":"napkinsToSellInput>toDecimal(napkinCount(userAddress))"//disables this button if the value entered by the user is greater than the number of napkins the user has, according to the contract.
     },
     "moveNapkinsButton":{
       "action":"moveNapkinsTo(napkinsToMoveInput,addressToMoveInput)",//multiple input fields can be used as parameters
       "disable":"napkinsToMoveInput>toDecimal(napkinCount(userAddress))"
     },
     /*
      Uses a macro, expands to entries for potatoPriceSpan0,potatoPriceSpan1,potatoPriceSpan2,potatoPriceSpan3, and all internal instances of %i% are also replaced with the respective number.
     */
     "potatoPriceSpan%i%":{
       "display":"weiToDisplay(potatoPrices(%i%))"
     },
     "potatoOwnerSpan%i%":{
       "display":"potatoOwners(%i%).substring(0,10)+'...'"
     },
     "buyPotatoButton%i%":{
       "action":"buyPotato(potatoPrices(%i%),%i%)"//you can use calls to the smart contract inside other calls, if the outer one sends a transaction and the inner retrieves data (view function). Here the 'buyPotato' function is called with the result of a check for the price of that same potato, so that the correct amount of Eth is sent with the transaction. Note that no eth or decimal conversion was performed here; the number is kept as a hexidecimal string in order to preserve its exact value.
     },
     "refLink":{
       "display":"referralLink",//sets the text content to the url of the current user's referral link
       "attributes":{
         "href":"referralLink"//sets the href attribute to the url of the current user's referral link
       }
     },
  },
  "network":"Ropsten",//The network this contract is on. change to mainnet to connect to a contract on mainnet
  "contract":"0xd392bEDd5182FfCA0BBB855dAf5573dCD191703E",//the contract address

  //the ABI for the contract (can get from remix compile tab or etherscan)
  "abi":[
	{
		"constant": false,
		"inputs": [
			{
				"name": "referral",
				"type": "address"
			}
		],
		"name": "buyNapkins",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "getFreeNapkins",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "napkins",
				"type": "uint256"
			},
			{
				"name": "addr",
				"type": "address"
			}
		],
		"name": "moveNapkinsTo",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "potatoOwners",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "napkinCount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "lastNapkinTime",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "countdownTimeLeft",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "buyPotato",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "COUNTDOWN_TIME",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "napkins",
				"type": "uint256"
			}
		],
		"name": "sellNapkins",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "balance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "NAPKIN_VALUE",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "message",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "countdownIsUp",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "potatoPrices",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]
}
