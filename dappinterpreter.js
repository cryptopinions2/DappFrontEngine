/**
Frontend Engine for Ethereum Dapps. Fast, easy smart contract web integration! Configure with interfaceDefinition.js

https://github.com/cryptopinions2/DappFrontEngine
**/


interpreter={
  'main':function(){
    //console.log('test this ',interpreter)
    interpreter.expandMacros()
    interpreter.checkReservedWordsNotPresent()
    interpreter.checkDefinitionForErrors()
    try{
      interpreter.parseAbi(dappInterface.abi,dappInterface.contract)
      for(c in dappInterface.otherContracts){
        console.log('recording other contract abi ',c)
        interpreter.parseAbi(dappInterface.otherContracts[c].abi,dappInterface.otherContracts[c].contract,c)
      }
    }
    catch(err){
      throw 'ABI parsing failed with: '+err+'\n\n check that ABIs in interfaceDefinition.js are correct'
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
              alert("Please switch to appropriate network: "+dappInterface.network)
              //interpreter.disableButtons()
          }
          else{
            //interpreter.enableButtons()
          }
      }
      else{
        networkshouldbe=1
      }
    })
  },
  'refreshData':function(){
    interpreter.checkNetwork()
    interpreter.retrieveCalls()
    //interpreter.applyCalls()//will likely be from a previous retrieve, not the one just called
    console.log('DappFrontEngine refreshing data')
  },
  'sendTransaction':function(params,method,callback2){
    //console.log('sending transaction ',params,method.name)

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
    //console.log('sending transaction with parameters ',method.name,method.transact,params,myContract)
    var functionName=method.name.split('.');
    functionName=functionName[functionName.length-1]
    var outputData = myContract[functionName].getData(... params);
    tparams=Object.assign({to:method.contractAddress, from:null, data: outputData},tparams)
    //console.log('sending transaction with parameters ',tparams)
    var endstr=web3.eth[method.transact](tparams,callback2)//method.callback2);//method.callback);
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
        //logst('setting result: '+command+"|"+result)
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
    var secondsToString=interpreter.utilityFunctions.secondsToString
    var toDecimal=web3.toDecimal

    var boundVariables=interpreter.getBoundVariables()
    for(var f in interpreter.getKeys(boundVariables)){
      if (typeof f == 'undefined'){
        throw "parameter undefined "+boundvariables;
      }
      if(interpreter.utilityFunctions.isValidFunctionName(f) && boundVariables[f].toString().indexOf('\n')==-1){
        try{
          eval('var '+f+'="'+boundVariables[f]+'"')//set all these variables to the local function variable space
        }
        catch(err){
          throw 'could not eval1 variable '+f+' '+'var '+f+'="'+boundVariables[f]+'"\n'+err
        }
      }
    }
    //var command
    for(var c in interpreter.getKeys(interpreter.displayCalls)){
      var method=interpreter.solmethods[c]
      //console.log('applying call0',c)
      for(var c2 in interpreter.getKeys(interpreter.displayCalls[c])){
        //console.log('applying call',c,c2)
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
      console.log('dappInterpreter.js command \n"'+initialCommand+'" ('+command+')\n failed with exception: ',err)
      //throw 'couldnt eval command'
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
      else{
        refcode=refcode.toLowerCase()
      }
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
    //console.log('displaycalls are ',interpreter.getKeys(interpreter.displayCalls))
    for(var c in interpreter.getKeys(interpreter.displayCalls)){
      for(var c2 in interpreter.getKeys(interpreter.displayCalls[c])){
        var paramstr=c2;

        //console.log('getting calls ',paramstr,c)
        //(function(displayCalls,paramstr,c){
          //console.log('paramstr is??',paramstr,c)
          interpreter.executeCall(interpreter.displayCalls,paramstr,c)//(displayCalls,paramstr,c)//
        //})(interpreter.displayCalls,paramstr,c)
      }
    }
    //console.log('current calls: ',interpreter.displayCalls)
  },
  //c is the name of the function being called
  'executeCall':function(callsObj,paramstr,c){
    //console.log('executecall ',c,paramstr)
    var method=interpreter.solmethods[c]
    var boundVariables=interpreter.getBoundVariables()
    //console.log('boundvariables are',boundVariables)
    for(var f in interpreter.getKeys(boundVariables)){
      if (typeof f == 'undefined'){
        throw "parameter undefined "+boundvariables;
      }
      //console.log('executecall boundvar',boundVariables[f],f,interpreter.utilityFunctions.isValidFunctionName(f))
      if(interpreter.utilityFunctions.isValidFunctionName(f) && boundVariables[f].toString().indexOf('\n')==-1){
        try{
          eval('var '+f+'="'+boundVariables[f]+'"')//set all these variables to the local function variable space
        }
        catch(err){
          throw 'could not eval2 variable '+f+' '+'var '+f+'="'+boundVariables[f]+'"\n'+err
        }
      }
    }
    var weiToDisplay=interpreter.utilityFunctions.weiToDisplay
    var getQueryVariable=interpreter.utilityFunctions.getQueryVariable
    var ethToWei=interpreter.utilityFunctions.ethToWei
    var weiToEth=interpreter.utilityFunctions.weiToEth
    var secondsToString=interpreter.utilityFunctions.secondsToString
    var toDecimal=web3.toDecimal
    var strparams
    if(paramstr.length>0){
      var strparams=paramstr.split(',')
    }
    else{
      var strparams=[]
    }
    var params=[]
    for(var i=0;i<strparams.length;i++){
      try{
        params.push(interpreter.getCommandResult(strparams[i]))//eval(strparams[i]))
      }
      catch(err){
        throw 'could not eval3 '+strparams[i]+'\n'+err
      }
    }

    //interpreter.sendTransactionWithCallback(params,method,c,paramstr,callsObj)

    var timecalled=Date.now()
    //setTimeout(console.log('amicrazy',timecalled),1000)
    //console.log('sendTransaction from executecall',params,c,paramstr,callsObj,timecalled)
    interpreter.sendTransaction(params,method,function(error,result){
      //console.log('doing callback2 ',result,method)
      //console.log('recieveTransactionWithCallback',params,c,paramstr,callsObj,timecalled)
      if(!error){
        callsObj[c][paramstr]=interpreter.parseResultByType(result,method.resultType)
      }else{console.log('transaction '+method.name+' failed with ',error.message)}

    })
  },
  'parseResultByType':function(result,type){
    //console.log('parseresultbytype ',result,type)
    if(type.indexOf('none')!=-1){
      return '"'+result+'"'
    }
    if(type.indexOf('uint')!=-1){
      return '"'+result+'"'
    }
    if(type.indexOf('bool')!=-1){
      return result.indexOf('1')!=-1
    }
    if(type.indexOf('string')!=-1){
      return '"'+web3.toAscii(result)+'"'
    }
    if(type.indexOf('address')!=-1){
      //0x000000000000000000000000aebbd80fd7dae979d965a3a5b09bbcd23eb40e5f
      //console.log('address printing ',result.substring(26))
      return '"0x'+result.substring(26)+'"'
    }
    return result
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
        console.log('error: ',('Could not find element id '+f))
        throw 'Could not find element id '+f
      }
      //console.log('ireojoijoi??',f,dappInterface.elementsById[f])
      if('display' in dappInterface.elementsById[f]){
        interpreter.defineCallsInCommand(dappInterface.elementsById[f].display)
      }
      if(dappInterface.elementsById[f].action){
        console.log('foundaction',dappInterface.elementsById[f].action)
        var lastCombo = interpreter.defineCallsInCommand(dappInterface.elementsById[f].action)
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
        interpreter.defineCallsInCommand(dappInterface.elementsById[f].disable)
      }
      if(dappInterface.elementsById[f].attributes){
        for(attr in dappInterface.elementsById[f].attributes){
          interpreter.defineCallsInCommand(dappInterface.elementsById[f].attributes[attr])
        }
      }
    }
    //console.log('defined calls ',interpreter.displayCalls)
  },
  'defineCallsInCommand':function(command){//},calls){
    console.log('definecallsincommand ',command)//,calls)
    var lastCombo=[]
    var solmethodkeys=[]
    for(var k in interpreter.getKeys(interpreter.solmethods)) solmethodkeys.push(k);
    solmethodkeys.sort(function(a, b){
      return b.length - a.length;
    });
    for(var i=0;i<solmethodkeys.length;i++){
      var s=solmethodkeys[i]
      var calls=interpreter.actionCalls
      if(interpreter.solmethods[s].transact=='call'){
        calls=interpreter.displayCalls
      }
    //for(var s in interpreter.getKeys(interpreter.solmethods)){
      while(command.indexOf(s+'(')!=-1){
        var thatpart=command.substr(command.indexOf(s+'('))
        command=command.substr(command.indexOf(s+'(')+1)
        var inside=interpreter.getInsideParens(thatpart)
        if(!(s in calls)){
          calls[s]={}
        }
        calls[s][inside]=null
        lastCombo=[s,inside]
        console.log('insideparenscheck ',thatpart+'|'+s+'|'+inside+'|||',typeof inside,calls[s])
      }
      //console.log('jiojoeiwjoi',s)
    }
    //console.log('callsattheend ',calls)
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
    'secondsToString':function(seconds)
    {
        seconds=Math.max(seconds,0)
        var numdays = Math.floor(seconds / 86400);

        var numhours = Math.floor((seconds % 86400) / 3600);

        var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);

        var numseconds = ((seconds % 86400) % 3600) % 60;
        var endstr=""
        //if(numdays>0){
        //    endstr+=numdays + " days "
        //}

        return numhours + "h " + numminutes + "m "+numseconds+"s";
    },
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
      var ca = document.cookie.split(';');https://surge.sh/
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
    //console.log('oierjoeirje',clist)
    rightcount=0
    for(var i=0;i<clist.length;i++){
      if(clist[i]=='('){
        rightcount++;
      }
      if(clist[i]==')'){
        if(rightcount==0){
          console.log('getinsideparens result ',astr,astr.substr(0,i))
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
 'parseAbi':function(abiDefinition,contractAddress,contractName){
    for(f of abiDefinition){
        //console.log('processing part of data:',f)
        if(f['name']){
            var method={'numparams':0}
            method.contractAddress=contractAddress
            method.abi=abiDefinition
            //console.log('what is interpreter ',interpreter)
            method.name=f['name']
            if(contractName){
              method.name=contractName+'.'+method.name
            }
            interpreter.solmethods[method.name]=method
            //console.log('testing iteration '+f['name'])
            if (f['inputs']){
                method.numparams=f['inputs'].length
            }
            method.resultType='none'
            if (f['outputs']!=null && f['outputs'].length>0){
              method.resultType=f['outputs'][0]['type']
            }
            //value=''
            //console.log('checking function ',f)
            if (f['payable']==null){
                continue
            }
            //console.log('payable is: ',f['payable'])
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
  },
  recursiveValueReplace:function(obj,str,replace){
    for(var f in obj){
      if((typeof obj[f])=='string'){
        obj[f]=interpreter.replaceAll(obj[f],str,replace)
      }
      if((typeof obj[f])=='object'){
        recursiveValueReplace(obj[f],str,replace)
      }
    }
  },
  expandMacros:function(){
    if(dappInterface.macros){
      for(var k in dappInterface.macros){
        //console.log('macros test',k)

        for(var f in interpreter.getKeys(dappInterface.elementsById)){
          if(f.indexOf(k)!=-1){
            var elementwas=dappInterface.elementsById[f]
            delete dappInterface.elementsById[f]
            //interpreter.recursiveValueReplace(elementwas,k,"TEMPTEST")
            //console.log('elementwas ',elementwas)

            for(var i=0;i<dappInterface.macros[k].length;i++){
              var elementCopy=JSON.parse(JSON.stringify(elementwas))
              var replacement=dappInterface.macros[k][i]
              interpreter.recursiveValueReplace(elementCopy,k,replacement)
              var f2=interpreter.replaceAll(f,k,replacement)
              dappInterface.elementsById[f2]=elementCopy
            }
            //console.log('whatremains ',dappInterface.elementsById)
          }
          //console.log('macros test ',f)
        }
      }
    }
  }
}
