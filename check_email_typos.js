function check_email_typos(email, firstname, lastname, logging) {
    if (logging) {
        var log = console.log;
    } else {
        var log = function () {};
    }
    
    if (!email || email === '') 
        return null;
    
    var emailSplit = email.split('@');
    var leftPart = emailSplit[0].toLowerCase(),
        rightPart = emailSplit[1].toLowerCase();
    
    var personalSection = checkForNameTypo(leftPart, firstname, lastname);
    var domainSection = checkForDomainTypo(rightPart);
    var result = {
        userEmail: email
    };
    
    if (!personalSection && !domainSection) 
        return null;
    
    result.snippets = makeSnippets([personalSection, domainSection], email);
    result.correctedEmail = makeCorrectedString(result.snippets);
    
    if (result.correctedEmail == result.userEmail)
        result.correctedEmail = null;
    
    var correctedSplit = result.correctedEmail.split('@');
    if (personalSection) 
        result.personalSection = correctedSplit[0];
    if (domainSection) 
        result.domainSection = correctedSplit[1];
    
    log(result);
    
    return result;
    
    
    
    function makeSnippets(sections) {
        var snippets = [];
        var emailSplit = email.split('@');
        
        for (var i = 0; i < sections.length; i++) {
            if (sections[i]) {
                for (var j = 0; j < sections[i].length; j++) {
                    snippets.push(sections[i][j]);
                }
            } else {
                snippets.push({orig: emailSplit[i]});
            }
            if (i == 0) 
                snippets.push({orig: '@'});
        }
        return snippets;
    }
    
    function makeCorrectedString(snippets) {
        var corrected = '';
        for (var i = 0; i < snippets.length; i++) {
            corrected += snippets[i].correction || snippets[i].orig;
        }
        
        return corrected;
    }
    

    function checkForCloseMatch(longString, shortString, strict) {
        log('check for close match: ' + (strict ? 'strict' : 'loose'));
        // too many false positives with very short strings
        if (shortString.length < 3) 
            return null;
        
        // test if the shortString is in the string (so everything is fine)
        if (!strict) {
            var strContainsRegEx = new RegExp('(.?)'+shortString+'(.?)');
            
            if (strContainsRegEx.test(longString)) {
                log(longString + ' contains ' + shortString);
                var match = strContainsRegEx.exec(longString);
                return {
                    orig: shortString,
                    correction: shortString,
                    before: match[1],
                    after: match[match.length - 1]
                };
            }
        } else {
            if (shortString === longString) {
                log('shortString ' + shortString + ' = longString ' + longString);
                return null;
            }
        }
        
        log(longString);
        log(shortString);
        
        // split the shortString string into two at each position e.g. g|mail gm|ail gma|il gmai|l gmail|
        // and test that each half exists with one gap
        for (var i = 1; i <= shortString.length; i++) {
            var firstPart = shortString.substring(0, i);
            var secondPart = shortString.substring(i);
            var wordCharRegEx = new RegExp('[a-z]');
            var match;
            
            // test for extra letter
            var extraLetterRegEx = new RegExp(firstPart+'(.)'+secondPart);
            if (match = extraLetterRegEx.exec(longString)) {
                log('extra letter: ' + firstPart + ', ' + secondPart);
                log(match);
                return {
                    orig: firstPart + match[1] + secondPart,
                    correction: shortString,
                    before: '',
                    after: ''
                };
            }
            
            // test for wrong letter
            var wrongLetterRegEx = new RegExp('(.?)'+firstPart+'(.)'+secondPart.substring(1)+'(.?)');
            if (match = wrongLetterRegEx.exec(longString)) {
                if (wordCharRegEx.test(match[2])) {
                    log('wrong letter: ' + firstPart + ', ' + secondPart.substring(1));
                    log(match);
                    return {
                        orig: firstPart + match[2] + secondPart.substring(1),
                        correction: shortString,
                        before: match[1],
                        after: match[match.length - 1]
                    };
                }
            }
            
            // test for missing letter
            if (secondPart !== 'mail') {
                var firstPartSubstring = firstPart.substring(0,firstPart.length-1);
                var missingLetterRegEx = new RegExp('(.*)'+firstPartSubstring+secondPart+'(.*)');
                if (match = missingLetterRegEx.exec(longString)) {
                    if (strict || (!strict && firstPartSubstring != '' && firstPart.length != 1 &&    // do not correct cases like moni.orifee@gmail.com
                                   firstPart != shortString[0])) { 
                        log('missing letter: ' + firstPartSubstring + ', ' + secondPart);
                        log(match);
                        return {
                            orig: firstPartSubstring + secondPart,
                            correction: shortString,
                            before: match[1],
                            after: match[match.length - 1]
                        };
                    }
                    
                }
            }
            
            // test for switched letters
            var newFirstPart = shortString.substring(0, i - 1);
            var newSecondPart = shortString.substring(i + 1);
            var switchedLetters = shortString.charAt(i) + shortString.charAt(i - 1);
            
            var switchedLettersRegEx = new RegExp('(.?)'+newFirstPart+switchedLetters+newSecondPart+'(.?)');
            if (match = switchedLettersRegEx.exec(longString)) {
                log('switched letters: ' + newFirstPart + ', ' + newSecondPart);
                log(match);
                return {
                    orig: newFirstPart + switchedLetters + newSecondPart,
                    correction: shortString,
                    before: match[1],
                    after: match[match.length - 1]
                };
            }
        }
        
        return null;
    }
    
    function checkForDomainTypo(rightPart) {
        log('DOMAIN TYPO');
        var domains = ['gmail', 'hotmail', 'outlook', 'yahoo', 'icloud', 'mail', 'mac', 'aol', 'zoho'];
        var spl = rightPart.split('.');
        var userDomain = spl.shift();
        var userEnding = spl.join('.');
        var userEndingSplit = userEnding.split('.');
        var lastPart = userEndingSplit[userEndingSplit.length - 1];
        var result = [];
        
        var correctedDomain, correctedEnding;
        
        // if it contains any digits, reevaluate
        var endsWithDigitsRegEx = new RegExp('\\d+');
        if (endsWithDigitsRegEx.test(lastPart) || lastPart === 'con') {
            correctedEnding = lastPart;
            while (endsWithDigitsRegEx.test(correctedEnding)) {
                correctedEnding = correctedEnding.replace(endsWithDigitsRegEx, "")
            }
            // common mistake - catch it explicitly
            correctedEnding = correctedEnding === 'con' ? 'com' : correctedEnding;
        }
        
        // loop through common domains and test for a match
        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            log(domain);
            if (userDomain == domain) { 
                if (!correctedEnding)
                    return null;
            } else {
                correctedDomain = checkForCloseMatch(userDomain, domain, true);
            }
            
            if (correctedDomain || correctedEnding) {
                result = [];
                var domainElem = {orig: userDomain};
                var endingElem = {orig: userEnding};
                if (correctedDomain) { domainElem.correction = correctedDomain.correction; }
                if (correctedEnding) { endingElem.correction = correctedEnding; }
                result.push(domainElem);
                result.push({orig: '.'});
                result.push(endingElem);
                log(result);
                
                return result;
            }
        }
        
        return null;
    }
    
    function checkForNameTypo(leftPart, firstname, lastname) {
        log('NAME TYPO');
        // ignoring first and last name pairs that are similar
        if (!firstname || firstname == '' || !lastname || lastname == '' || checkForCloseMatch(firstname, lastname)) 
            return null;
        leftPart = leftPart.toLowerCase();
        firstname = firstname.toLowerCase();
        lastname = lastname.toLowerCase();
        
        var result = [];
        
        var fnameResult = searchForName(leftPart, 0, firstname);
        var newLeftPart;
        var startIndex;
        if (fnameResult) {
            if (fnameResult.elem.index + firstname.length + lastname.length > leftPart.length ) {
                newLeftPart = leftPart;
                startIndex = 0;
            } else {
                newLeftPart = fnameResult.newLeftPart;
                startIndex = fnameResult.startIndex;
            }
        } else {
            newLeftPart = leftPart;
            startIndex = 0;
        }
        
        var lnameResult = searchForName(newLeftPart, startIndex, lastname);
        
        log(fnameResult);
        log(lnameResult);
        var corrections = [];
        if (fnameResult && !fnameResult.found) 
            corrections.push(fnameResult.elem);
        if (lnameResult && !lnameResult.found) 
            corrections.push(lnameResult.elem);
        
        // check for double periods
        var doublePeriodRegex = new RegExp('(.*)\\.\\.(.*)');
        var dpCorrection = leftPart;
        while (doublePeriodRegex.test(dpCorrection)) {
            var match = doublePeriodRegex.exec(dpCorrection);
            log(match);
            
            dpCorrection = match[1]+'.'+match[2];
            corrections.push({
                index: match[1].length,
                orig: '..',
                correction: '.'
            });
        }

        
        if (corrections.length == 0) 
            return null;
        
        corrections.sort(function (a, b) {
            return a.index - b.index;
        });
        
        // make result object
        var startIndex = 0;
        for (var i = 0; i < corrections.length; i++) {
            result.push({orig: leftPart.substring(startIndex, corrections[i].index)});
            result.push({orig: corrections[i].orig, correction: corrections[i].correction});
            startIndex = corrections[i].index + corrections[i].orig.length;
        }
        result.push({orig: leftPart.substring(startIndex)})    
        
        result = result.filter(function (elem) { return elem.correction || elem.orig != ''; });
        
        log(result);
        return result;
        
        return null;
    }
    
    function searchForName(leftPart, index, name) {
        log('');
        log('searchForName');
        log(leftPart);
        log('');
        if (leftPart.length < name.length - 1 || name.length < 2) // leave room for 1 missing letter
            return null;
        
        var potentialName = leftPart.substring(0, name.length + 1); 
        var theRest = leftPart.substring(name.length + 1);
        
        var result = checkForCloseMatch(potentialName, name);
        log(result);
        
        if (result) {
            theRest = leftPart.substring(result.before.length + result.orig.length);
            log({orig: result.orig, theRest: theRest, correction: name});
        }
        
        // If we catch a missing letter typo and we have one letter left,
        // then skip this result
        if (result && result.orig === name.substring(0, result.orig.length) && theRest[0] == name[name.length - 1]) {
            log('ignoring result');
            result = null;
        }
        
        index += result ? result.before.length : 0;
        
        if (result && result.orig == result.correction) {
            return {
                found: true, 
                newLeftPart: theRest, 
                startIndex: index + name.length,
                elem: {
                    index: index,
                    orig: result.orig
                }
            };
        } else if (result) {
            var startIndexOffset = result.orig.length - result.correction.length;
            var toReturn = {
                newLeftPart: theRest,
                startIndex: index + name.length + startIndexOffset,
                elem: {
                    index: index,
                    orig: result.orig,
                    correction: name
                }
            };
            log('toReturn', toReturn);
            return toReturn;
        } else {
            return searchForName(leftPart.substring(1), index + 1, name);
        }
    }
}