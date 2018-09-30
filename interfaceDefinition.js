/*
  Edit this configuration file (or interfaceDefinitionBlank to start from scratch) to connect your html to a smart contract! All application logic can be specified here.

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

  Solidity functions can only be used as parameters of other solidity functions if the outer function creates a transaction, and the inner one is a view function. If you need to use results from a view function as parameters to another view function, the current workaround is to save those results in an input element and then use the id of that element as the parameter.
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

    hide: sets the element style to 'display:none', hiding it, if the expression evaluates to true

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
     "sellNapkinsDiv":{
       "hide":"toDecimal(napkinCount(userAddress))==0"//hides the entire sell section if user has no napkins
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
     "tokenCount":{
       "display":"weiToDisplay(vrfToken.balanceOf(userAddress))"//gets information from a secondary contract, vrfToken, specified in the "otherContracts" section of this config file.
     }
  },
  "network":"Ropsten",//The network this contract is on. change to mainnet to connect to a contract on mainnet
  "contract":"0x20263a01e0923914A4AA64c0dc21eDf2F5F9F3FB",//the contract address
  //the ABI for the contract (can get from remix compile tab or etherscan)
  "abi":[{"constant":false,"inputs":[{"name":"referral","type":"address"}],"name":"buyNapkins","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"getFreeNapkins","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"napkins","type":"uint256"},{"name":"addr","type":"address"}],"name":"moveNapkinsTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"potatoOwners","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"napkinCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lastNapkinTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"countdownTimeLeft","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"}],"name":"buyPotato","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"COUNTDOWN_TIME","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"napkins","type":"uint256"}],"name":"sellNapkins","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"balance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"NAPKIN_VALUE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"message","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"countdownIsUp","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"potatoPrices","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}],

/*
  other contracts. Can be used by calling like contractName.contractFunction()
*/
  "otherContracts":{
    "vrfToken":{
      "contract":"0xe0832c4f024D2427bBC6BD0C4931096d2ab5CCaF",
      "abi":[{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"lastClaimed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"timestep","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dayStartTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ethVerify","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"claimTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"claimedYesterday","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"claimedToday","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dailyDistribution","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"TokensClaimed","type":"event"}]
    }
  }
}
