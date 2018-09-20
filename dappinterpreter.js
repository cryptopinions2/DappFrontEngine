/**
Frontend Engine for Ethereum Dapps. Fast, easy smart contract web integration! Configure with interfaceDefinition.js

https://github.com/cryptopinions2/DappFrontEngine
**/

interpreter={
  'main':function(){
    //console.log('test this ',interpreter)
    interpreter.checkReservedWordsNotPresent()
    interpreter.checkDefinitionForErrors()
    try{
      interpreter.parseAbi()
    }
    catch(err){
      throw 'ABI parsing failed with: '+err+'\n\n check that ABI in interfaceDefinition.js is correct'
    }
    interpreter.defineCalls()
    setTimeout(function(){interpreter.retrieveCalls()},300)
    //interpreter.retrieveCalls()
    interpreter.controlLoop()
    interpreter.controlLoopFast()
  },
  'controlLoopFast':function(){
    interpreter.applyCalls()
    setTimeout(function(){interpreter.controlLoopFast()},300)
  },
  'controlLoop':function(){
    interpreter.refreshData()
    setTimeout(function(){interpreter.controlLoop()},2500)
  },
  'validNetworkNames':['mainnet','main','ropsten'],
  'checkNetwork':function(){
    web3.version.getNetwork((err, netId) => {
        if(dappInterface.network){
          if(typeof dappInterface.network=='number'){
            networkshouldbe=dappInterface.network
            return
          }
          var nname=dappInterface.network.toLowerCase()
          var networkshouldbe=dappInterface.network
          switch (nname) {
            case "mainnet":
              //console.log('This is mainnet')
              networkshouldbe=1
              break
            case "main":
              //console.log('This is mainnet')
              networkshouldbe=1
              break
            case "ropsten":
              //console.log('This is the ropsten test network.')
              networkshouldbe=3
              break
            }

          if(netId!=networkshouldbe){
              alert("Please switch to appropriate network "+dappInterface.network)
              //interpreter.disableButtons()
          }
          else{
            //interpreter.enableButtons()
          }
      }
      else{
        networkshouldbe=1
      }
        /*
      switch (netId) {
        case "1":
          console.log('This is mainnet')
          break
        case "2":
          console.log('This is the deprecated Morden test network.')
          break
        case "3":
          console.log('This is the ropsten test network.')
          break
        default:
          console.log('This is an unknown network.')
      }*/
    })
  },
  'refreshData':function(){
    interpreter.checkNetwork()
    interpreter.retrieveCalls()
    //interpreter.applyCalls()//will likely be from a previous retrieve, not the one just called
    console.log('DappFrontEngine refreshing data')
  },
  'sendTransaction':function(params,method,callback2){
    //console.log('sending transaction ',params,method.name,method,callback2)
    var contractAbi = web3.eth.contract(method.abi);
    var myContract = contractAbi.at(method.contractAddress);
    var tparams={}
    if(method.payable){
      if(method.numparams<params.length){
        tparams.value=params[0]
        params=params.slice(1)
      }
      else{
        tparams.value=0
      }
    }
    var outputData = myContract[method.name].getData(... params);
    method.callback2=callback2
    tparams=Object.assign({to:method.contractAddress, from:null, data: outputData},tparams)
    var endstr=web3.eth[method.transact](tparams,method.callback);
  },
  'applyCalls':function(){
    if(!web3.eth.accounts[0]){
      return
    }
    //go through commands for display, then
    //interpreter.displayCalls('displaycalls right before interpretation')
    interpreter.checkReservedWordsNotPresent()
    for(var f in interpreter.getKeys(dappInterface.elementsById)){
      var command=dappInterface.elementsById[f].display
      if(command){
        var result=interpreter.getCommandResult(command)
        //console.log('setting result: ',command,result)
        if(result!=null){
          interpreter.setElementText(f,result)
        }
        else{
          //console.log('result not defined')
          //interpreter.setElementText(f,'?')
        }
      }
      command=dappInterface.elementsById[f].disable
      //console.log('disablecheck: ',f,command)
      if(command){
        //console.log('disablecommand ',command)
        var result=interpreter.getCommandResult(command)
        var element=document.getElementById(f)
        //console.log('disablecheck: ',f,element,command,result,element.disabled)
        interpreter.setElementDisabled(element,result)
      }
      if(dappInterface.elementsById[f].attributes){
        for(attr in dappInterface.elementsById[f].attributes){
          //console.log('attribute check: ',attr)
          command=dappInterface.elementsById[f].attributes[attr]
          if(command){
            //console.log('disablecommand ',command)
            var result=interpreter.getCommandResult(command)
            var element=document.getElementById(f)
            //console.log('disablecheck: ',f,element,command,result,element.disabled)
            if(result!=null){
              document.getElementById(f)[attr]=result
            }
          }
        }
      }
    }
  },
  'setElementDisabled':function(element,disabled){
    //console.log('setelementdisabled ',element,disabled)
    if(element.nodeName=="A"){
      if(disabled){
        if(element.style['pointer-events']!='none')
          element.style['pointer-events']='none'
      }
      else{
        if(element.style['pointer-events']!='')
          element.style['pointer-events']=''
      }
    }
    if(element.nodeName=="BUTTON"){
      if(disabled){
        if(!element.disabled){
          element.disabled=true;
        }
      }
      else{
        if(element.disabled){
          element.disabled=false;
        }
      }
    }
  },
  'getCommandResult':function(command){
    //console.log('getting result of command ',command)
    var initialCommand=command
    var weiToDisplay=interpreter.utilityFunctions.weiToDisplay
    var getQueryVariable=interpreter.utilityFunctions.getQueryVariable
    var ethToWei=interpreter.utilityFunctions.ethToWei
    var weiToEth=interpreter.utilityFunctions.weiToEth

    var boundVariables=interpreter.getBoundVariables()
    for(var f in interpreter.getKeys(boundVariables)){
      if (typeof f == 'undefined'){
        throw "parameter undefined "+boundvariables;
      }
      if(interpreter.utilityFunctions.isValidFunctionName(f) && boundVariables[f].toString().indexOf('\n')==-1){
        eval('var '+f+'="'+boundVariables[f]+'"')//set all these variables to the local function variable space
      }
    }
    var command
    for(var c in interpreter.getKeys(interpreter.displayCalls)){
      var method=interpreter.solmethods[c]
      //console.log('applying call0',c)
      for(var c2 in interpreter.getKeys(interpreter.displayCalls[c])){
        //console.log('applying call',c,c2,f)
        var callstr=c+'('+c2+')'
        //var command2=command.replace(callstr,interpreter.displayCalls[c][c2])
        var command2 = interpreter.replaceAll(command,callstr,interpreter.displayCalls[c][c2]) //command.replace(callstr,interpreter.displayCalls[c][c2]) //fix type issues here
        //console.log('new command is ',command,command2)
        command=command2
      }
    }
    //console.log('newcommand',command)
    //console.log('elementid',f)
    var result
    try{
      result=eval(command)
    }
    catch(err){
      console.log('dappInterpreter.js command \n"'+initialCommand+'""\n failed with exception: ',err)
    }
    //console.log('command result ',command,result)
    return result
  },
  'replaceAll':function(target,search, replacement) {
        return target.split(search).join(replacement);
    },
  'setElementText':function(elementId,result){
    var element=document.getElementById(elementId)
    if(element.tagName=='INPUT'){
      element.value=result
    }
    else{
      element.textContent=result
    }
  },
  'checkReservedWordsNotPresent':function(){
    var variables=""
    var reservedWords=interpreter.getReservedWords()
    //console.log(getGlobalProperties())
    for(var name in window){
      //console.log('global variable ',name)
      if(reservedWords.indexOf(name)>=0){
        console.log("\n\n************************\n\nWARN: DappFrontEngine reserved word '"+name+"' present in global scope, unexpected behavior may occur\n\n******************")
      }
    }
  },
  'getReservedWords':function(){
    var reservedWords = ['initialCommand','command','result','weiToDisplay','weiToEth','ethToWei','getQueryVariable']
    for(var v in interpreter.getBoundVariables()){
      //console.log('reserved word ',v)
      reservedWords.push(v)
    }
    return reservedWords
  },
  'getBoundVariables':function(){
    var boundVariables={}
    boundVariables['userAddress']=web3.eth.accounts[0]
    boundVariables['referralLink']=window.location.origin+"?ref="+web3.eth.accounts[0]
    boundVariables['etherscanLink']='https://etherscan.io/address/'+dappInterface.contract.toLowerCase()
    if(dappInterface.network.toLowerCase().indexOf('ropsten')!=-1){
      boundVariables['etherscanLink']=boundVariables['etherscanLink'].replace('etherscan.io','ropsten.etherscan.io')
    }
    var refcode=interpreter.utilityFunctions.getQueryVariable('ref')
    if(!refcode){
      refcode=interpreter.utilityFunctions.getCookie('ref')
      if(!refcode){
        refcode=0
      }
    }
    else{
      interpreter.utilityFunctions.setCookie('ref',refcode)
    }
    //console.log('refcode variable ',(typeof refcode),refcode)
    if(refcode){
      if(refcode.toLowerCase()==web3.eth.accounts[0]){//don't allow self refers from the frontend
        refcode=0
      }
      refcode=refcode.toLowerCase()
    }
    else{refcode=0}
    boundVariables['referralAddress']=refcode
    var elementswithid=document.querySelectorAll('*[id]')
    for(var i=0;i<elementswithid.length;i++){
      var input=""
      input=elementswithid[i].textContent
      if(elementswithid[i].value){
        input=elementswithid[i].value
      }
      boundVariables[elementswithid[i].id]=input
      //console.log('retrievecallselement',elementswithid[i])
    }
    return boundVariables
  },
  'retrieveCalls':function(){
    if(!web3.eth.accounts[0]){
      return
    }
    for(var c in interpreter.getKeys(interpreter.displayCalls)){
      for(var c2 in interpreter.getKeys(interpreter.displayCalls[c])){
        var paramstr=c2
        interpreter.executeCall(interpreter.displayCalls,paramstr,c)
      }
    }
    //console.log('current calls: ',interpreter.displayCalls)
  },
  //c is the name of the function being called
  'executeCall':function(callsObj,paramstr,c){
    var method=interpreter.solmethods[c]
    var boundVariables=interpreter.getBoundVariables()
    //console.log('boundvariables are',boundVariables)
    for(var f in interpreter.getKeys(boundVariables)){
      if (typeof f == 'undefined'){
        throw "parameter undefined "+boundvariables;
      }
      //console.log('executecall boundvar',boundVariables[f],f,interpreter.utilityFunctions.isValidFunctionName(f))
      if(interpreter.utilityFunctions.isValidFunctionName(f) && boundVariables[f].toString().indexOf('\n')==-1){
        eval('var '+f+'="'+boundVariables[f]+'"')//set all these variables to the local function variable space
      }
    }
    var weiToDisplay=interpreter.utilityFunctions.weiToDisplay
    var getQueryVariable=interpreter.utilityFunctions.getQueryVariable
    var ethToWei=interpreter.utilityFunctions.ethToWei
    var weiToEth=interpreter.utilityFunctions.weiToEth
    var strparams
    if(paramstr.length>0){
      var strparams=paramstr.split(',')
    }
    else{
      var strparams=[]
    }
    var params=[]
    for(var i=0;i<strparams.length;i++){
      params.push(eval(strparams[i]))
    }
    //console.log('paramstr',params,strparams,method)
    interpreter.sendTransaction(params,method,function(result){
      //console.log('doing callback2 ',result,method)
      callsObj[c][paramstr]=result
    })
  },
  'displayCalls':{},
  'actionCalls':{},
  //'disableCalls':{},
  //'actionCallValues':{},
  //value===null
  'defineCalls':function(){
    //console.log('fwerw???',dappInterface)
    for(var f in interpreter.getKeys(dappInterface.elementsById)){
      if(!document.getElementById(f)){
        throw 'Could not find element id '+f
      }
      //console.log('ireojoijoi??',f,dappInterface.elementsById[f])
      if('display' in dappInterface.elementsById[f]){
        interpreter.defineCallsInCommand(dappInterface.elementsById[f].display,interpreter.displayCalls)
      }
      if(dappInterface.elementsById[f].action){
        console.log('foundaction',dappInterface.elementsById[f].action)
        var lastCombo = interpreter.defineCallsInCommand(dappInterface.elementsById[f].action,interpreter.actionCalls)
        console.log('setting onclick',f)
        console.log('???',document.getElementById(f))
        lastCombo.push(f)
        try{throw lastCombo}//this is to workaround method getting replaced within the function because javascript scoping is horrible
        catch(lastCombo){
          f=lastCombo[2]
          document.getElementById(f).onclick=function(){
            console.log('clicked button and now executing call',f,lastCombo)
            interpreter.executeCall(interpreter.actionCalls,lastCombo[1],lastCombo[0])
          }
        }
      }
      if(dappInterface.elementsById[f].disable){
        interpreter.defineCallsInCommand(dappInterface.elementsById[f].disable,interpreter.displayCalls)
      }
      if(dappInterface.elementsById[f].attributes){
        for(attr in dappInterface.elementsById[f].attributes){
          interpreter.defineCallsInCommand(dappInterface.elementsById[f].attributes[attr],interpreter.displayCalls)
        }
      }
    }
  },
  'defineCallsInCommand':function(command,calls){
    var lastCombo=[]
    var solmethodkeys=[]
    for(var k in interpreter.getKeys(interpreter.solmethods)) solmethodkeys.push(k);
    solmethodkeys.sort(function(a, b){
      return b.length - a.length;
    });
    for(var i=0;i<solmethodkeys.length;i++){
      var s=solmethodkeys[i]
    //for(var s in interpreter.getKeys(interpreter.solmethods)){
      if(command.indexOf(s+'(')!=-1){
        var thatpart=command.substr(command.indexOf(s+'('))
        var inside=interpreter.getInsideParens(thatpart)
        if(!(thatpart in calls)){
          calls[s]={}
        }
        calls[s][inside]=null
        lastCombo=[s,inside]
        console.log('insideparenscheck ',thatpart,inside)
      }
      //console.log('jiojoeiwjoi',s)
    }
    return lastCombo
  },
  'disableButtons':function(){
      var allnumshrimp=document.getElementsByClassName('btn')
      for(var i=0;i<allnumshrimp.length;i++){
          if(allnumshrimp[i]){
              //allnumshrimp[i].style.display="none"
              allnumshrimp[i].disabled=true
          }
      }
  },
  'enableButtons':function(){
      var allnumshrimp=document.getElementsByClassName('btn-lg')
      for(var i=0;i<allnumshrimp.length;i++){
          if(allnumshrimp[i]){
              allnumshrimp[i].style.display="inline-block"
          }
      }
  },
  'utilityFunctions':{
    'isValidFunctionName' : function(s) {
      var validName = /^[$A-Z_][0-9A-Z_$]*$/i;
      var reserved = {
        'abstract':true,
        'boolean':true,
        // ...
        'with':true
      };
      //return function(s) {
        // Ensure a valid name and not reserved.
        return validName.test(s) && !reserved[s];
      //};
    },
    'weiToDisplay':function(ethprice){
        return interpreter.formatEthValue(web3.fromWei(ethprice,'ether'))
    },
    'ethToWei':function(eth){
      return web3.toWei(eth,'ether')
    },
    'weiToEth':function(wei){
      return web3.fromWei(wei,'ether')
    },
    'formatEthValue':function(ethstr){
        return parseFloat(parseFloat(ethstr).toFixed(5));
    },
    'getQueryVariable':function(variable)
    {
           var query = window.location.search.substring(1);
           var vars = query.split("&");
           for (var i=0;i<vars.length;i++) {
                   var pair = vars[i].split("=");
                   if(pair[0] == variable){return pair[1];}
           }
           return(false);
    },
     'setCookie':function(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    },
 'getCookie':function(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
  },
  },
  'getInsideParens':function(astr){
    astr=astr.substr(astr.indexOf('(')+1)
    clist=astr.split('')
    console.log('oierjoeirje',clist)
    rightcount=0
    for(var i=0;i<clist.length;i++){
      if(clist[i]=='('){
        rightcount++;
      }
      if(clist[i]==')'){
        if(rightcount==0){
          return astr.substr(0,i)
        }
        else{
          rightcount--;
        }
      }
    }
    return null
  },
  'getKeys':function(obj){
    var keys = {};
    for(var k in obj){
     if(obj.hasOwnProperty(k)){
       keys[k]=obj[k];
     }
   }
    return keys
  },
  'solmethods':{},
 'parseAbi':function(){

    for(f of dappInterface.abi){
        console.log('processing part of data:',f)
        if(f['name']){
            var method={'numparams':0}
            method.contractAddress=dappInterface.contract
            method.abi=dappInterface.abi
            //console.log('what is interpreter ',interpreter)
            interpreter.solmethods[f['name']]=method
            method.name=f['name']
            //console.log('testing iteration '+f['name'])
            if (f['inputs']){
                method.numparams=f['inputs'].length
            }
            try{throw method}//this is to workaround method getting replaced within the function because javascript scoping is horrible
            catch(method){
              method.callback=function(error,result){
                if(!error){//console.log('method result1 ',method.name,result);
                 method.callback2(result);}else{console.log('transaction failed with ',error.message)}
              }
            }
            if (f['outputs']!=null && f['outputs'].length>0){
                //console.log('outputs: ',f['outputs'])
                if(f['outputs'][0]['type'].indexOf('uint')!=-1){
                  try{throw method}
                  catch(method){
                    method.callback=function(error,result){
                      if(!error){//console.log('method result2 ',method.name,result);
                       method.callback2(web3.toDecimal(result));}else{console.log('transaction failed with ',error.message)}
                    }
                  }
                  //console.log('testing callback function ')
                  try{
                    method.callback()
                  }
                  catch(err){
                    console.log('error',err)
                  }
                    //callback='web3.toDecimal(result)'
                }
                if (f['outputs'][0]['type'].indexOf('string')!=-1){
                  try{throw method}
                  catch(method){
                  method.callback=function(error,result){
                    if(!error){//console.log('method result3 ',method.name,result);
                     method.callback2(web3.toAscii(result));}else{console.log('transaction failed with ',error.message)}}
                  }
                    //callback='web3.toAscii(result)'
                }
                if (f['outputs'][0]['type'].indexOf('bool')!=-1){
                  try{throw method}
                  catch(method){
                  method.callback=function(error,result){
                    if(!error){//console.log('method result4 ',method.name,result);
                     method.callback2(result.indexOf('1')!=-1);}else{console.log('transaction failed with ',error.message)}
                  }
                }
                    //result.indexOf('1')!=-1
                }
            }
            //value=''
            console.log('checking function ',f)
            if (f['payable']==null){
                continue
            }
            console.log('payable is: ',f['payable'])
            if (f['payable']){
                method.payable=f['payable']
                //value=',value: eth'
                //params+='eth,'
            }
            method.transact='call'
            //transact='call'
            if(!f['constant']){
                method.transact='sendTransaction'
                //transact='sendTransaction'
            }
            // ftext=ftext.replaceAll('%TRANSACT%',transact)
            // ftext=ftext.replaceAll('%VALUE%',value)
            // ftext=ftext.replaceAll('%CONVERSION%',callback)
            // ftext=ftext.replaceAll('%PARAMS%',params)
            // ftext=ftext.replaceAll('%PARAMS2%',params2)
            // ftext=ftext.replaceAll('%NAME%',f['name'])
            // functions+=ftext+'\n'
        }
    }
  }
  ,
  weiToDisplay:function(ethprice){
      return formatEthValue(web3.fromWei(ethprice,'ether'))
  },
   formatEthValue:function(ethstr){
      return parseFloat(parseFloat(ethstr).toFixed(5));
  },
  checkDefinitionForErrors:function(){
    if((typeof dappInterface)=='undefined' || !dappInterface || (typeof dappInterface)!='object'){
      throw 'Interface definition not found. Add <script src="interfaceDefinition.js"></script> to head element of index.html, and ensure interfaceDefinition.js exists in your project and is correctly formatted.'
    }
    mandatoryElements=['abi','elementsById','contract']
    for(var i=0;i<mandatoryElements.length;i++){
      if(!dappInterface[mandatoryElements[i]]){
        throw 'interfaceDefinition.js must contain valid \"'+mandatoryElements[i]+'\" attribute'
      }
    }
    if(dappInterface.network && (typeof dappInterface.network)=='string'){
      if(interpreter.validNetworkNames.indexOf(dappInterface.network.toLowerCase())==-1){
        throw 'network name '+dappInterface.network+' invalid, must be one of ['+interpreter.validNetworkNames+']'
      }
    }
    if((typeof dappInterface.elementsById)!='object'){
      throw 'elementsById in interfaceDefinition.js must be of type "object"'
    }
  }
}
