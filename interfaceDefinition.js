var dappInterface={
  "elementsById":{
    "myNapkinsDiv":{
      "display":"napkinCount(userAddress)",
      "action":""
    },
    "getFreeNapkinsButton":{
      "action":"getFreeNapkins()"
    },
    "buyNapkinsButton":{
      "display":"'Buy '+Math.floor(ethToWei(napkinsToBuyInput)/NAPKIN_VALUE())+' Napkins'",
      "action":"buyNapkins(ethToWei(napkinsToBuyInput))", //weiToDisplay(ethToWei(napkinsToBuyInput)/NAPKIN_VALUE())
      //"actionPayment":"ethToWei(napkinsToBuyInput)"
    }
    // "moveNapkinsButton":{
    //   "display":"napkinstomove",
    //   "action":"moveNapkinsTo(napkinstomove,addresstomove)"
    // }
  },
  "network":"Ropsten",
  "contract":"0xC063dBc5Df0082a32842F27E2b3Ddfa7e538b989",//"0xeecc8FA365D32C2a6d60A77986F1dC0cD0b4172C",
  "abi":[{"constant":false,"inputs":[],"name":"getFreeNapkins","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"napkins","type":"uint256"},{"name":"addr","type":"address"}],"name":"moveNapkinsTo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"napkinCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"buyNapkins","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"lastNapkinTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"COUNTDOWN_TIME","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"napkins","type":"uint256"}],"name":"sellNapkins","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"NAPKIN_VALUE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"message","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"countdownIsUp","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}]
}
