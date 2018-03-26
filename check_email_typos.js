// Returns an object with the following properties:
//      userEmail:       // The user's original email as a string.
//      correctedEmail:  // The corrected email as a string.
//      personalSection: // A string of the left part of the email, if 
//                       // there is a typo in that section. Not always present.
//      domainSection:   // A string of the right part of the email, if
//                       // there is a typo in that section. Not always present.
//      snippets:        // An array of objects containing snippets of 
//                          the email. The objects look like this:
//          orig:        // A snippet of the original email.
//          correction:  // A corrected snippet of the original email. Not always present.
// 
// Adapted from https://hackernoon.com/how-to-reduce-incorrect-email-addresses-df3b70cb15a9
// 
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
                log('extra letter match');
                // ignore cases where the extra letter is a non-word character that might be intentional, like
                // a hyphen or an underscore
                if (strict || (!strict && (/[A-Za-z0-9]/).test(match[1]))) { 
                    log('extra letter: ' + firstPart + ', ' + secondPart);
                    log(match);
                    return {
                        orig: firstPart + match[1] + secondPart,
                        correction: shortString,
                        before: '',
                        after: ''
                    };
                }
            }
            
            // test for wrong letter
            var wrongLetterRegEx = new RegExp('(.?)'+firstPart+'(.)'+secondPart.substring(1)+'(.?)');
            if (match = wrongLetterRegEx.exec(longString)) {
                log('wrong letter match');
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
                    log('missing letter match');
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
                log('switched letter match');
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
        
        var correctedDomain, correctedLastPart;
        
        // if it contains any digits, reevaluate
        var endsWithDigitsRegEx = new RegExp('\\d+');
        if (endsWithDigitsRegEx.test(lastPart) || lastPart === 'con') {
            correctedLastPart = lastPart;
            while (endsWithDigitsRegEx.test(correctedLastPart)) {
                correctedLastPart = correctedLastPart.replace(endsWithDigitsRegEx, "")
            }
            // common mistake - catch it explicitly
            correctedLastPart = correctedLastPart === 'con' ? 'com' : correctedLastPart;
        }
        
        // loop through common domains and test for a match
        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            log(domain);
            if (userDomain.length > domain.length + 1 || userDomain.length < domain.length - 1)
                continue;
            else if (userDomain == domain) { 
                if (!correctedLastPart)
                    return null;
            } else {
                correctedDomain = checkForCloseMatch(userDomain, domain, true);
                if (correctedDomain && correctedDomain.orig != userDomain)
                    correctedDomain = null;
            }
            
            if (correctedDomain || correctedLastPart) {
                result = [];
                var domainElem = {orig: userDomain};
                var endingElem = {orig: userEnding};
                if (correctedDomain) { domainElem.correction = correctedDomain.correction; }
                if (correctedLastPart) {
                    userEndingSplit[userEndingSplit.length - 1] = correctedLastPart;
                    endingElem.correction = userEndingSplit.join('.'); 
                }
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
        if (!firstname || firstname == '' || !lastname || lastname == '')
            return null;
            
        // adapted from http://semplicewebsites.com/removing-accents-javascript
        var latinMap = {"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":["A","AE"],"Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":["A","AA"],"Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"[AE,E]","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":["O","OE"],"Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":["O","OE"],"Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":["U","UE"],"Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":["a","ae"],"ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":["a","aa"],"ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"[ae,e]","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":["o","oe"],"ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":["o","oe"],"ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":["u","ue"],"ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};    
        // find the max num of possibilities for each mapping above (some map to arrays)
        var maxPossibilities = 1;
        Object.keys(latinMap).forEach(function (key) {
            maxPossibilities = Math.max(maxPossibilities, Array.isArray(latinMap[key]) ? latinMap[key].length : 1)
        })
        
        leftPart = leftPart.toLowerCase();
        var firstnameNormalized = normalizeName(firstname);
        var lastnameNormalized = normalizeName(lastname);
        firstname = firstnameNormalized[0];
        lastname = lastnameNormalized[0];
        var firstnameAlternates = firstnameNormalized[1],
            lastnameAlternates = lastnameNormalized[1];
        log(firstname);
        log(lastname);
        log(firstnameAlternates);
        log(lastnameAlternates);
        
        function normalizeName(name) {
            var nonLatinRegex = new RegExp("[^A-Za-z0-9\\[\\] ]", "g");
            var initialsRegex = new RegExp("(^(\\w )+)|(( \\w)+$)", "g");
            var alternates = [];
            
            if (nonLatinRegex.test(name)) {
                alternates[maxPossibilities - 1] = ''; // set length
                alternates.fill('');
                var appendToAllAlternates = function(str) {
                    for (var i = 0; i < alternates.length; i++) {
                        alternates[i] += str;
                    }
                }
                
                for (var i = 0; i < name.length; i++) {
                    var x = name[i];
                    if (nonLatinRegex.test(x)) {
                        if (latinMap[x] && Array.isArray(latinMap[x])) {
                            for (var j = 0; j < latinMap[x].length; j++) {
                                alternates[j] += latinMap[x][j];
                            }
                        } else if (latinMap[x]) {
                            appendToAllAlternates(latinMap[x]);
                        } else {
                            appendToAllAlternates(name[i]);
                        }
                    } else {
                        appendToAllAlternates(name[i]);
                    }
                }
            } else {
                alternates = [name];
            }
            
            // eliminate duplicates
            alternates = alternates.filter(function(elem, index, self) {
                return index == self.indexOf(elem);
            }); 
            
            for (var i = 0; i < alternates.length; i++) {
                alternates[i] = alternates[i].replace(initialsRegex, '').toLowerCase().replace(/[^a-z]/g, '')
            }
            
            return [alternates.pop(), alternates];
            
        }
                        
        // ignoring first and last name pairs that are similar
        // also check that initial + name combos are not similar to the other name
        if (foundSimilarities(firstname, lastname) || foundSimilarities(firstname, firstname[0] + lastname) ||
            foundSimilarities(lastname[0] + firstname, lastname))
            return null;
        
        function foundSimilarities(firstname, lastname) {
            var shorterName = firstname.length < lastname.length ? firstname : lastname;
            var longerName = firstname.length < lastname.length ? lastname : firstname;
            log('checking for similarities in first and last name');
            for (var i = 0; i < longerName.length - (shorterName.length - 1); i++) {
                var longerNameSubstring = longerName.substring(i, shorterName.length + 1 + i)
                if (checkForCloseMatch(shorterName, longerNameSubstring) || checkForCloseMatch(longerNameSubstring, shorterName))
                    return true;
            }
        }
        
        // hardcode some nicknames that we should ignore corrections to
        var nicknames = {
            'jenny': 'jenni',
            'peter': 'pete',
            'ann': 'an', // diane
            'jono': 'jona', // jonathan
            'joe': 'jose', // joseph
            'charlie': 'charle', // charles
            'paul': 'pabl', // pablo
        }
        
        var result = [];
        
        var fnameResult = searchForName(leftPart, 0, firstname);
        var newLeftPart;
        var startIndex;
        
        if (fnameResult) {
            var squishedLeftPart = leftPart.substring(0, fnameResult.elem.index) + fnameResult.newLeftPart;
            // ignore attempts to correct nicknames
            if (fnameResult.elem.orig == nicknames[fnameResult.elem.correction])
                fnameResult = null;
            // ignore corrections that match name alternates
            else if (isNameAlternate(fnameResult.elem.orig, firstnameAlternates))
                fnameResult = null;
            // ignore corrections that eliminate a correctly-spelled lastname
            else if (strIncludes(lastname, leftPart) && !strIncludes(lastname, squishedLeftPart))
                fnameResult = null;
        }
        
        // set left part and start index for lastname check
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
        
        // ignore corrections that match name alternates
        if (lnameResult && isNameAlternate(lnameResult.elem.orig, lastnameAlternates))
            lnameResult = null;
        
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
    
    function isNameAlternate(name, alternates) {
        return alternates.indexOf(name) > -1;
    }
    
    function strIncludes(substr, str) {
        return str.indexOf(substr) != -1;
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
        if (result && result.orig !== result.correction && 
            (result.orig === name.substring(0, result.orig.length) && theRest[0] == name[name.length - 1] ||
            result.orig.substring(0, name.length - 1) === name.substring(0, name.length - 1))) {
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