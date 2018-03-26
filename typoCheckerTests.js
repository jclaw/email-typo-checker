function test_email_typos() {
    const testInputs = [
        // correct
        {firstName: '', lastName: '', email: 'first.last@example.com', expectedResult: {}},
        {firstName: 'yo', lastName: 'shortname', email: 'david.gilbertson@yahoo.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.GILBERTSON@gmail.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@SOME+THING-ODD!!.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'DAVId.gilbertson@outlook.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@yahoo.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@hotmail.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'blah@unknown.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'blah@hotmail.co.uk', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson2@xxxxx.com', expectedResult: {}},
        {firstName: 'david', lastName: 'daivd',      email: 'david.daivd@xxxxx.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@mail.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'gilbertsonjdavid94@xxxxx.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertsonn@xxxxx.com', expectedResult: {}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertsone@xxxxx.com', expectedResult: {}},
        {firstName: 'j', lastName: 'c', email: 'jandcsup@gmail.com', expectedResult: {}},
        
        // domain typo
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@gmial.com', expectedResult: {domainTypo: 'gmail.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@gmal.com', expectedResult: {domainTypo: 'gmail.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@gmai.com', expectedResult: {domainTypo: 'gmail.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@mai.com', expectedResult: {domainTypo: 'mail.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@mao.com', expectedResult: {domainTypo: 'mac.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@outloik.com', expectedResult: {domainTypo: 'outlook.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@outloook.com', expectedResult: {domainTypo: 'outlook.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@outllook.com', expectedResult: {domainTypo: 'outlook.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@yohoo.com', expectedResult: {domainTypo: 'yahoo.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@yaho.com', expectedResult: {domainTypo: 'yahoo.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertson@gmail.con', expectedResult: {domainTypo: 'gmail.com'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'nothankspig76@gamil.con73160', expectedResult: {domainTypo: 'gmail.com'}},
        {firstName: 'j', lastName: 'c', email: 'jandcsup@gamil.com', expectedResult: {domainTypo: 'gmail.com'}},
        
        // name typo
        {firstName: 'david', lastName: 'gilbertson', email: 'daivd.gilbertson@xxxxx.com', expectedResult: {nameTypo: 'david.gilbertson'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'daavid.gilbertson@xxxxx.com', expectedResult: {nameTypo: 'david.gilbertson'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'davd.gilbertson@xxxxx.com', expectedResult: {nameTypo: 'david.gilbertson'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertsin@xxxxx.com', expectedResult: {nameTypo: 'david.gilbertson'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.gilbertsson@xxxxx.com', expectedResult: {nameTypo: 'david.gilbertson'}},
        
        {firstName: 'david', lastName: 'gilbertson', email: 'daivd.gilbertson2@xxxxx.com', expectedResult: {nameTypo: 'david.gilbertson2'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'daavid.gilbertson2@xxxxx.com', expectedResult: {nameTypo: 'david.gilbertson2'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'david.giblertson2@xxxxx.com', expectedResult: {nameTypo: 'david.gilbertson2'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'davd.giilbertson2@xxxxx.com', expectedResult: {nameTypo: 'david.gilbertson2'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'davd.p..giilbertson.987@xxxxx.com', expectedResult: {nameTypo: 'david.p.gilbertson.987'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'davd..p..giilbertson.987@xxxxx.com', expectedResult: {nameTypo: 'david.p.gilbertson.987'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'gilbertso..d@xxxxx.com', expectedResult: {nameTypo: 'gilbertso.d'}}, // don't correct typos at end of name
        
        {firstName: 'david', lastName: 'gilbertson', email: 'gilbeertson_davd@xxxxx.com', expectedResult: {nameTypo: 'gilbertson_david'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'gilberson_dvaid94@xxxxx.com', expectedResult: {nameTypo: 'gilbertson_david94'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'gilberson-dvaid94@xxxxx.com', expectedResult: {nameTypo: 'gilbertson-david94'}},
        
        {firstName: 'david', lastName: 'gilbertson', email: 'gilbertsondvaid94@xxxxx.com', expectedResult: {nameTypo: 'gilbertsondavid94'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'gilbrtsondvaid94@xxxxx.com', expectedResult: {nameTypo: 'gilbertsondavid94'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'gilbertsinjpdaivd94@xxxxx.com', expectedResult: {nameTypo: 'gilbertsonjpdavid94'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'gilbertsojdaivd94@xxxxx.com', expectedResult: {nameTypo: 'gilbertsojdavid94'}},  // don't correct typos at end of name
        {firstName: 'david', lastName: 'gilbertson', email: 'davidphtgilbertswnjr94@gmail.com', expectedResult: {nameTypo: 'davidphtgilbertsonjr94'}},
        {firstName: 'david', lastName: 'gilbertson', email: 'davdphtgilbrtsonjr94@gmail.com', expectedResult: {nameTypo: 'davidphtgilbertsonjr94'}},
        
        // false positives from webapps
        {firstName: 'andrew', lastName: 'chafermann', email: 'chafermann@mcad.edu', expectedResult: {}},
        {firstName: 'rob', lastName: 'sen', email: 'Rob.sen3000@googlemail.com', expectedResult: {}},
        {firstName: 'todd', lastName: 'graham', email: 'toddsg@sbcglobal.net', expectedResult: {}},
        {firstName: 'Alfred', lastName: "O'Reilly", email: 'ajoreilly@mta.ca', expectedResult: {}},
        {firstName: 'Aire', lastName: "Dolan", email: 'adolan@umich.edu', expectedResult: {}},
        {firstName: 'Robin', lastName: "Moldwin", email: 'rmoldwin@alumni.uchicago.edu', expectedResult: {}},
        {firstName: 'Susan', lastName: "Keane", email: 'keane2007@tiscali.co.uk', expectedResult: {}},
        {firstName: 'Kevin', lastName: "Foomoo Kwang", email: 'foomookwang@axis-ics.com', expectedResult: {}},
        {firstName: 'Kevin', lastName: "Foomoo Kwang", email: 'foomoo-kwang@axis-ics.com', expectedResult: {}},
        {firstName: 'Kevin', lastName: "Foomoo Kwang", email: 'foomoo_kwang@axis-ics.com', expectedResult: {}},
        {firstName: 'Kevin', lastName: "Foomoo Kwang", email: 'foomoo9kwang@axis-ics.com', expectedResult: {nameTypo: 'foomookwang'}},
        {firstName: 'Jenny', lastName: "Hochberg", email: 'jennifer.hochberg@loop.colum.edu', expectedResult: {}},
        {firstName: "Raphaël", lastName: "POMPON", email: 'raphael.pompon49@gmail.com', expectedResult: {}},
        {firstName: "françois", lastName: "Riant", email: "francois.riant@gmail.com", expectedResult: {}},
        {firstName: "Cécile", lastName: "Hoeborn", email: "cecile.ash@gmx.de", expectedResult: {}},
        {firstName: "Riley C", lastName: "Gray", email: "rileygray+bandcamp@gmail.com", expectedResult: {}},
        {firstName: "Riley C D", lastName: "Gray", email: "rileygray+bandcamp@gmail.com", expectedResult: {}},
        {firstName: "D Riley", lastName: "Gray", email: "rileygray+bandcamp@gmail.com", expectedResult: {}},
        {firstName: "C D Riley", lastName: "Gray", email: "rileygray+bandcamp@gmail.com", expectedResult: {}},
        {firstName: "C D Riley J", lastName: "Gray", email: "rileygray+bandcamp@gmail.com", expectedResult: {}},
        {firstName: "OᴙgÖn", lastName: "HḘrꜩ", email: "orgonjhertz@gmail.com", expectedResult: {}},
        {firstName: "Peter", lastName: "Taylor", email: "freeheelpete@gmail.com", expectedResult: {}},
        {firstName: "Ann", lastName: "Glenane", email: "dianeglenane@gmail.com", expectedResult: {}},
        {firstName: "Gary", lastName: "Segger", email: "gazza@taureans.plus.con", expectedResult: {domainTypo: "taureans.plus.com"}},
        {firstName: "Geoffrey", lastName: "Shimotsu", email: "shimotsg@gmail.com", expectedResult: {}},
        {firstName: "Eve", lastName: "Jeffrey", email: "evejeffrey8@gmail.com", expectedResult: {}},
        {firstName: "Aaron", lastName: "Broom", email: "aaronbroom3993@hotmail.com", expectedResult: {}},
        {firstName: "Hoa", lastName: "Pham", email: "pham.hoa.ngoc@gmail.com", expectedResult: {}},
        {firstName: "Gina", lastName: "Iannitelli", email: "giannite@gmail.com", expectedResult: {}},
        {firstName: "Gerald", lastName: "Löscher", email: "gerald.loescher@liwest.at", expectedResult: {}},
        {firstName: "Gerald", lastName: "Löscher", email: "gerald.loscher@liwest.at", expectedResult: {}},
        {firstName: "Brian", lastName: "Canty", email: "bricanty46@gmail.com", expectedResult: {}},
        {firstName: "paul", lastName: "lowrey", email: "machopablo@gmail.com", expectedResult: {}},
        {firstName: "Kristian", lastName: "Hæggernes", email: "kristian_heggernes@hotmail.com", expectedResult: {}},
        
        
        // name typo and domain typo
        {firstName: 'david', lastName: 'gilbertson', email: 'gilberson_dvaid94@gnail.com', expectedResult: {nameTypo: 'gilbertson_david94', domainTypo: 'gmail.com'}},
        
    ];
    
    testInputs.forEach(function(testInput) {
        var result = Form.validate.check_email_typos(testInput.email, testInput.firstName, testInput.lastName);
        // console.log(testInput.firstName+', '+testInput.lastName+', '+testInput.email+' => {domainTypo: '+testInput.expectedResult.domainTypo+', nameTypo: '+testInput.expectedResult.nameTypo+'}');
        
        var nameTypo, domainTypo;
        if (result) {
            var resultSplit = result.correctedEmail.split('@');
            if (result.personalSection) { nameTypo = resultSplit[0];}
            if (result.domainSection) { domainTypo = resultSplit[1];}
        } 
        console.assert(testInput.expectedResult.domainTypo === domainTypo, testInput.firstName+', '+testInput.lastName+', '+testInput.email+' => {domainTypo: '+domainTypo+'} should have been {domainTypo: '+testInput.expectedResult.domainTypo+'}');
        console.assert(testInput.expectedResult.nameTypo === nameTypo, testInput.firstName+', '+testInput.lastName+', '+testInput.email+' => {nameTypo: '+nameTypo+'} should have been {nameTypo: '+testInput.expectedResult.nameTypo+'}');
    });

}

function test_supportcase_email_typos() {
    
    const testInputs = [
        {firstName: 'Nick', lastName: 'Harris', email: 'Legeredemain8197@gmail.com', expectedEmail: 'legerdemain8197@gmail.com'},
        {firstName: 'Mario', lastName: 'Laguns', email: 'mlaguns2@gamil.com', expectedEmail: 'mlaguns2@gmail.com'},
        {firstName: 'Bob', lastName: 'Mackintosh', email: 'mckeand@hotmail.com', expectedEmail: 'mckeando@hotmail.com'},
        {firstName: 'Erica', lastName: 'Jobe', email: 'erica@ercarhone.com', expectedEmail: 'erica@ericarhone.com'},
        {firstName: 'Toni', lastName: '', email: 'accounts@bassnoesessions.com', expectedEmail: 'accounts@bassnotesessions.com'},
        {firstName: 'Teresa', lastName: 'Zobel', email: 'terzo57@gmail.com', expectedEmail: 'terzob57@gmail.com'},
        {firstName: 'Paula', lastName: 'Johnson', email: 'paulaj.masage@gmail.com', expectedEmail: 'Paulaj.massage@gmail.com'},
        {firstName: 'Joao', lastName: '', email: 'apollo14gamez@gmaim.com', expectedEmail: 'apollo14gamez@gmail.com'},
        {firstName: 'Jay', lastName: 'Wilson', email: 'nothankspig76@gmail.com73160', expectedEmail: 'nothankspig76@gmail.com'},
        {firstName: 'Que', lastName: 'Sakamoto', email: 'djquesakamo_tokyo@icloud.com', expectedEmail: 'djquesakamoto_tokyo@icloud.com'},
        {firstName: 'Krissi', lastName: 'Lerotic', email: 'krissi.krissi.lerotic@gmail.com', expectedEmail: 'krissi.lerotic@gmail.com'},
        {firstName: 'Seamus', lastName: 'France', email: 'spiieydudey@gmail.com', expectedEmail: 'spikeydudey@gmail.com'},
        {firstName: 'Mary', lastName: 'Puthawala', email: 'mputhawala@9.com', expectedEmail: 'mputhawala@mac.com'},
        {firstName: 'Jess', lastName: 'Sedler', email: 'jess_swdler@hotmail.com', expectedEmail: 'jess_sedler@hotmail.com'},
        {firstName: 'DJ', lastName: 'Darden', email: 'kunis@gmail.com', expectedEmail: 'kunislove@gmail.com'},
        {firstName: 'Chris', lastName: '', email: 'drummer.for.jesos@gmail.com', expectedEmail: 'drummer.for.jesus@gmail.com'},
        {firstName: 'Irina', lastName: 'Sazonova', email: 'sazonova.iy@gmail.con', expectedEmail: 'sazonova.iy@gmail.com'},
        {firstName: 'Mike', lastName: 'Hoepting', email: 'mhoepting@gmal.com', expectedEmail: 'mhoepting@gmail.com'},
        {firstName: 'Nathaniel', lastName: 'Brown', email: 'nvjr658@gmail.com', expectedEmail: 'nbjr658@gmail.com'},
        {firstName: 'John', lastName: 'Jillard', email: 'Johnandrupi@yahoo.co.co.uk', expectedEmail: 'Johnandrupi@yahoo.co.uk'},
        {firstName: 'Amy', lastName: 'Riling', email: 'amyjriling@gmail.con', expectedEmail: 'amyjriling@gmail.com'},
        {firstName: 'Karl', lastName: 'Smith', email: 'karl.p.smith97@gmail.con', expectedEmail: 'karl.p.smith97@gmail.com'},
        {firstName: 'Chris', lastName: 'Nelsen', email: 'nelsen11@gmail.com', expectedEmail: 'Chrisnelsen11@gmail.com'},
        {firstName: 'Damian', lastName: 'Smith', email: 'damianjamessmith@gmail.con', expectedEmail: 'damianjamessmith@gmail.com'},
        {firstName: 'Marie', lastName: 'Migullas', email: 'marsmogullas@gmail.com', expectedEmail: 'marsmigullas@gmail.com'},
        {firstName: 'Nick', lastName: 'Maguire', email: 'nickjmaguure@gmail.com', expectedEmail: 'nickjmaguire@gmail.com'},
        {firstName: 'Mysti', lastName: 'Glogau', email: 'mystiglogau@yahoo.com', expectedEmail: 'mystiglogau@gmail.com'},
        {firstName: 'Arbra', lastName: 'Campbell', email: 'arbracampbell@al.com', expectedEmail: 'arbracampbell@aol.com'},
        {firstName: 'scott', lastName: 'ames', email: 'PW_AMES@YAHO.COM', expectedEmail: 'PW_AMES@YAHOO.COM'},
        {firstName: 'Sam', lastName: 'Cater', email: 'sancater@bigpond.com', expectedEmail: 'samcater@bigpond.com'},
        {firstName: 'Ivan', lastName: 'Rodriguez', email: 'ivan.rguez@gmail.com', expectedEmail: 'ivan.rdguez@gmail.com '},
        {firstName: 'Tony', lastName: 'Licata', email: 'licatat.97@hotmail.com', expectedEmail: 'licatat.97@gmail.com'},
        {firstName: 'Mary', lastName: 'Richards', email: 'ricardsml@mac.com', expectedEmail: 'richardsml@mac.com'},
        {firstName: 'Karen', lastName: 'Robles', email: 'kroble@scu.edu', expectedEmail: 'krobles@scu.edu'},
        {firstName: 'Cory', lastName: 'Ditringo', email: 'cditringo@gmail.con', expectedEmail: 'Cditringo@gmail.com'},
        {firstName: 'Sophie', lastName: 'White', email: 'sopwhite@gmai.com', expectedEmail: 'sopwhite@gmail.com'},
        {firstName: 'Cody', lastName: 'sullivan', email: 'codbsullivan@hotmail.com', expectedEmail: 'Codybsullivan@hotmail.com'},
        {firstName: 'Sergei', lastName: 'Shchukin', email: 'shchukin.sg@gHmail.com', expectedEmail: 'shchukin.sg@gmail.com'},
        {firstName: 'Greg', lastName: 'Haines', email: 'eazygddz@mail.com', expectedEmail: 'Eazygddz@gmail.com'},
        {firstName: 'Danielle', lastName: 'Mckinnon', email: 'dmc85@hotmail.com', expectedEmail: 'Dmc85@hotmail.co.uk'},
        {firstName: 'Scott', lastName: 'Houghton', email: 'scotrhoughton@gmail.com', expectedEmail: 'Scottrhoughton@gmail.com'},
        {firstName: 'Cedric', lastName: 'brisson', email: 'cedruc.brisson.3@gmail.com', expectedEmail: 'cedric.brisson.3@gmail.com'},
        {firstName: 'Rachel', lastName: 'Dor', email: 'rachel.m..dor@gmsil.com', expectedEmail: 'Rachel.m.dor@gmail.com'},
        {firstName: 'anne', lastName: 'rochat', email: 'annme.rochat6@gmail.com', expectedEmail: 'anne.rochat6@gmail.com'},
        {firstName: 'Jiří', lastName: 'Miškeřík', email: 'everwn@seznam.cz', expectedEmail: 'everwin@seznam.cz'},
        {firstName: 'Francois', lastName: 'Larouche', email: 'larouche.francois@hitmail.com', expectedEmail: 'larouche.francois@hotmail.com'},
        {firstName: 'Casey', lastName: 'Gorham', email: 'gorham.case@yahoo.com', expectedEmail: 'Gorham.casey@yahoo.com'},
        {firstName: 'Dante', lastName: 'Stewart', email: 'dantesyewart25@gmail.com', expectedEmail: 'dantestewart25@gmail.com'},
        {firstName: 'Robert', lastName: 'Emery', email: 'syroaphex117@gmail.com', expectedEmail: 'syrophex117@gmail.com'},
        {firstName: 'Derek', lastName: 'Arrington', email: 'aurocratastic@gmail.com', expectedEmail: 'autocratastic@gmail.com'},
    ]
    
    var notGoingToFix = [
        'Legeredemain8197@gmail.com',
        'mckeand@hotmail.com',
        'erica@ercarhone.com',
        'accounts@bassnoesessions.com',
        'terzo57@gmail.com',
        'paulaj.masage@gmail.com',
        'djquesakamo_tokyo@icloud.com',
        'krissi.krissi.lerotic@gmail.com', // supposed to be 'krissi.lerotic@gmail.com'
        'spiieydudey@gmail.com',
        'mputhawala@9.com', // wrong domain
        'kunis@gmail.com',
        'drummer.for.jesos@gmail.com',
        'nvjr658@gmail.com',
        'Johnandrupi@yahoo.co.co.uk',
        'nelsen11@gmail.com', // forgot to include their first name
        'mystiglogau@yahoo.com', // wrong domain
        'ivan.rguez@gmail.com', // misspelled incomplete last name
        'dmc85@hotmail.com', // meant to type .co.uk
        'everwn@seznam.cz',
        'syroaphex117@gmail.com',
        'aurocratastic@gmail.com',
        'eazygddz@mail.com', // a typo for gmail.com, but mail.com is valid
        'codbsullivan@hotmail.com', // wants to be corrected to codybsullivan but becomes codysullivan instead, which is what we want
        'scotrhoughton@gmail.com', // same as above, but scotthoughton instead of scottrhoughton
        'licatat.97@hotmail.com' // supposed to be gmail
    ]
    
    var missedTypos = [];
    
    testInputs.forEach(function(testInput) {
        var result = Form.validate.check_email_typos(testInput.email, testInput.firstName, testInput.lastName);
        // console.log(testInput.firstName+', '+testInput.lastName+', '+testInput.email+' => {domainTypo: '+testInput.expectedResult.domainTypo+', nameTypo: '+testInput.expectedResult.nameTypo+'}');
        
        var specificTypoEmail = '';
        var correctedResult = '';
        
        if (result) {
            correctedResult = result.correctedEmail.toLowerCase();
            correctedResult = correctedResult;
            var [leftPartCorrected, rightPartCorrected] = correctedResult.split('@');
            specificTypoEmail += leftPartCorrected || '';
            specificTypoEmail += '@';
            specificTypoEmail += rightPartCorrected || '';
        }
        
        
        
        if (testInput.expectedEmail.toLowerCase() !== correctedResult) {
            testInput.correctedEmail = specificTypoEmail;
            missedTypos.push(testInput);
        }
        
    });
    
    console.log((50 - missedTypos.length) + '/50 successful');
    console.log('missedTypos:');
    // return missedTypos.filter(function(i) {return notGoingToFix.indexOf(i.email) < 0;})
    return missedTypos;
}